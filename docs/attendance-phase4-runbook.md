# Attendance Phase 4 Operations Runbook

Status: preparation only. No production database changes or external issue/calendar entries were made by this runbook.

## Rollback reference

The annotated tag `pre-attendance-consolidation` is published on `origin` at `e13ef04`. It points to committed pre-consolidation code and does not contain the current uncommitted worktree changes. Confirm with:

```bash
git show --no-patch --format='%H %s' pre-attendance-consolidation
git ls-remote --tags origin pre-attendance-consolidation
```

Application rollback to this tag does not reverse database DDL. Treat code and database rollback as separate operations.

## Database foreign-key migration

The physical schema uses `attendance.atdnc_id` and `additional_attendance.atdnc_id`; do not use `attendance_id` or `id` in orphan checks. The expected relationship is one additional-attendance row per attendance row, with deletion of a parent attendance deleting its optional extension.

### Preflight

1. Confirm which production deployment is active (the documented systemd service or production Compose) and identify its database host/schema without printing credentials.
2. Use a read-only database session first. For the current systemd deployment, the application config is `/root/config/application.properties`; do not `cat` or paste secret-bearing lines.
3. From the intended schema, run the standalone read-only file and inspect every result set:

```bash
mysql --host="$DB_HOST" --user="$DB_USER" -p --database="$DB_NAME" \
  < deploy/mysql/migrations/P20261007__additional_attendance_fk_preflight.sql
```

The two data-check result sets at the end must be empty. Review both `SHOW CREATE TABLE` outputs and the index/constraint result sets for equivalent keys, FK, matching types/signedness, and storage engine. Do not continue if the schema is unexpected.

4. **Preflight is a hard gate:** if either data query returns rows, stop before backup/apply. Export affected records, agree on their business disposition with the data owner, and prepare a separately reviewed cleanup script. Do not delete or reassign rows automatically.

The checks performed by the standalone file are:

```sql
SELECT atdnc_id, COUNT(*) AS record_count
FROM additional_attendance
GROUP BY atdnc_id
HAVING atdnc_id IS NULL OR COUNT(*) > 1;

SELECT aa.additional_atdnc_id, aa.atdnc_id
FROM additional_attendance aa
LEFT JOIN attendance a ON a.atdnc_id = aa.atdnc_id
WHERE a.atdnc_id IS NULL;
```

5. Verify the column types/signedness match and confirm cascade deletion is approved. Hibernate `ddl-auto=update` may already have created an equivalent unique key or FK under a generated name. If so, do not add a duplicate constraint.

### Backup and staging apply

Take and verify a consistent backup before DDL. Use an interactive password prompt, not a password in the command line:

```bash
DB_HOST=127.0.0.1
DB_NAME=hrm_db
DB_USER=hrm_user
BACKUP_FILE="hrm-before-attendance-fk-$(date +%Y%m%d-%H%M%S).sql"
mysqldump --host="$DB_HOST" --single-transaction --routines --triggers --events \
  --user="$DB_USER" -p "$DB_NAME" > "$BACKUP_FILE"
test -s "$BACKUP_FILE"
```

Restore the backup into an isolated staging database and repeat all preflight checks there. The required order is **preflight first -> inspect/record clean results -> backup -> recheck preflight -> forward migration**. Never run the forward file before reviewing preflight output.

The forward file repeats duplicate/null and orphan checks using a temporary stored procedure and raises SQLSTATE `45000` before any `ALTER TABLE` if data is invalid. Run it through the MySQL CLI (the script uses `DELIMITER`), do not use `--force`, and stop if the client exits non-zero. If the guard signals an error, fix the data only under an approved cleanup plan, rerun the separate preflight, and start again. A failed guard may leave the helper procedure behind; the next run drops it at the start.

MySQL DDL is not transactional. The data guard prevents the known duplicate/orphan partial-change case, but it cannot protect against unrelated DDL failures such as incompatible column definitions or duplicate existing constraints. If the preflight finds equivalent constraints, do not run the whole forward file unchanged: have the DBA execute only the missing, reviewed `ALTER TABLE` statements and record the actual constraint names for rollback.

After staging apply:

```sql
SHOW CREATE TABLE attendance;
SHOW CREATE TABLE additional_attendance;
SELECT aa.additional_atdnc_id
FROM additional_attendance aa
LEFT JOIN attendance a ON a.atdnc_id = aa.atdnc_id
WHERE a.atdnc_id IS NULL;
```

Confirm the unique index, the FK to `attendance.atdnc_id`, and zero orphans. Exercise application create/update/read/delete flows in staging, including confirming extension data is deleted only when its parent attendance is deleted. Record results and get DBA approval before production.

### Production and rollback

Repeat the same backup and preflight on production immediately before applying the reviewed DDL. Keep the backup outside the application host and verify it can be read/restored. Apply during the approved change window, then rerun `SHOW CREATE TABLE`, orphan checks, and application health/smoke tests.

The rollback file is `deploy/mysql/migrations/U20261007__additional_attendance_fk.sql`. Use it only if the named constraints from the forward migration were actually created. If Hibernate had generated equivalent constraints under other names, do not drop those blindly. DDL rollback removes enforcement but does not restore extension rows that may have been cascade-deleted after deployment; restore data only under an approved recovery plan.

## Legacy API consumer audit

Record the actual production rollout date with Ops. Define **usage-window end = production rollout date + 14 calendar days**; removal is permitted no earlier than the following day (**rollout date + 15 calendar days**) after logs and external-client signoff pass. For a 2026-10-07 rollout, the window ends 2026-10-21 and the earliest removal date is 2026-10-22. If rollout differs, update the ADR, OpenAPI deprecation descriptions, ticket due date, and calendar event before treating them as deadlines. Do not start the usage window from a code-edit or local-build date.

The production Nginx config proxies `/employee` paths. First confirm access logging and retention on the actual server:

```bash
sudo nginx -T 2>/dev/null | grep -E 'access_log|log_format'
```

If the standard Nginx access log is available, aggregate legacy route usage daily without retaining request bodies or authorization headers:

```bash
sudo zgrep -hE '"GET /employee/(attendanceList|lastattendanceList)/' /var/log/nginx/access.log* \
  | awk '{ day=substr($4,2,11); route=$7; status=$9;
           if (route ~ /^\/employee\/attendanceList\//) name="attendanceList";
           else if (route ~ /^\/employee\/lastattendanceList\//) name="lastattendanceList";
           else next;
           print day, name, status; }' \
  | sort | uniq -c
```

Also check any API gateway/CDN logs and ask known integrations, payroll/reporting owners, and partner teams directly. Nginx source IPs may represent NAT or a proxy and are not proof of client identity. Store aggregate counts, restrict raw log access, and never log JWTs. Keep enough log retention to cover the full deprecation window.

Removal gate: all in-repository callers have migrated; owners of known external clients confirm migration; no legacy hits for the full 14 days after production rollout; and Ops signs off. If any client still calls a legacy route, extend the deadline and contact its owner.

## Cutover ticket draft

**Title:** Remove deprecated attendance routes and legacy UI redirects

**Blocked by:** confirmation and recording of the production rollout date; the 14-day usage window; external-client signoff; and Ops/DBA staging migration approval

**Due:** no earlier than production rollout date + 15 calendar days (the day after the 14-day window), provisionally 2026-10-22 only if production rollout is 2026-10-07. Do not file with a fixed due date until rollout is confirmed.

**Owners:** HRM backend/frontend owner and Operations

**Acceptance criteria:**

- Confirm and attach the daily legacy-route aggregate for the complete deprecation period.
- Confirm external API consumers have migrated; extend the window if any legacy call remains.
- Remove the three deprecated methods from `EmployeeController` and their OpenAPI entries.
- Remove the five legacy attendance redirect components and their routes/imports from `App.tsx`.
- Run full backend tests, frontend build, and Redocly contract lint.
- Deploy, smoke-test the centralized attendance views, and update the ADR.

No issue-tracker integration is available in this workspace, so this is a ready-to-file ticket draft, not a created remote issue.

## Final handover checklist

Repository preparation is complete; operational items below remain pending until the named owners execute and record them.

### Before staging migration

- [ ] DBA runs `P20261007__additional_attendance_fk_preflight.sql` against staging and records schema, constraint, duplicate/null, and orphan results.
- [ ] Data owner approves and DBA reviews any required orphan cleanup; no automatic cleanup is provided.
- [ ] DBA takes and verifies a staging backup, then reruns preflight immediately before DDL.

### Staging migration

- [ ] DBA applies only the reviewed missing constraints; forward guards must pass.
- [ ] Verify unique key, FK, zero orphans, and application create/update/read/delete behavior.
- [ ] Record DBA approval before production.

### Production and deprecation

- [ ] DBA repeats preflight/backup/recheck and applies the reviewed migration in the approved window.
- [ ] Verify schema, data integrity, application health, and smoke tests; retain rollback SQL and backup.
- [ ] Ops records the production frontend/API rollout date and gathers 14 full calendar days of legacy-route usage metrics.
- [ ] Confirm external consumers migrated, file the cutover ticket, calculate earliest removal as rollout + 15 days, and update/import the calendar event.
- [ ] After the removal gate passes, remove backend wrappers and frontend redirect routes/files, then run tests/build/lint and update the ADR.

## Contract validation and separate backlog

GitHub Actions runs `npx --yes @redocly/cli@2.59.0 lint docs/openapi/attendance.yaml`; the same command can be run from the repository root locally. The current CI workflow also runs `mvn clean verify` with Java 21 before deployment.

The Vite chunk-size warning is unrelated to attendance consolidation. Keep code splitting/manual chunk work in a separate frontend performance ticket.
