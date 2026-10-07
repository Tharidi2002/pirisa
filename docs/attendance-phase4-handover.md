# Attendance Consolidation: DBA and Ops Handover

**Status:** Repository preparation is complete. Staging/production database work, external-client confirmation, production rollout date, issue creation, and calendar import are pending with the named owners below. No live database or remote ticket/calendar changes have been made from this workspace.

## Source artifacts

- [Operations runbook](attendance-phase4-runbook.md)
- [Read-only database preflight](../deploy/mysql/migrations/P20261007__additional_attendance_fk_preflight.sql)
- [Fail-fast forward migration](../deploy/mysql/migrations/V20261007__additional_attendance_fk.sql)
- [Rollback SQL](../deploy/mysql/migrations/U20261007__additional_attendance_fk.sql)
- [OpenAPI contract](openapi/attendance.yaml)
- [Tentative calendar event](calendar/attendance-legacy-route-cutover.ics)
- [Architecture decision record](adr/attendance-consolidation-adr.md)

The physical relationship is `additional_attendance.atdnc_id` -> `attendance.atdnc_id`. Do not use `attendance_id` or `attendance.id` in queries.

## DBA Handover

### Before staging

1. Confirm the target schema and active deployment. Use a read-only account for preflight; never paste database credentials into the ticket or email.
2. Run from the repository root against staging:

```bash
mysql --host="$DB_HOST" --user="$DB_USER" -p --database="$DB_NAME" \
  < deploy/mysql/migrations/P20261007__additional_attendance_fk_preflight.sql
```

3. Save the schema/index/constraint results in the change record. Expected clean data results:
   - Duplicate/null `additional_attendance.atdnc_id` query: **0 rows**.
   - Orphan query against `attendance.atdnc_id`: **0 rows**.
   - `SHOW CREATE TABLE` confirms compatible key types and engines.
   - Constraint query identifies any equivalent unique key or FK Hibernate may already have created.
4. If duplicate, null, or orphan rows appear, stop. Export and preserve the affected rows; get a data-owner decision and DBA-reviewed cleanup before retrying. No cleanup is included or authorized by this package.
5. Take a consistent backup and verify it is non-empty and restorable. Then rerun preflight immediately before applying DDL.

### Apply and verify staging

Only after clean preflight and backup, and after checking for equivalent existing constraints:

```bash
mysql --host="$DB_HOST" --user="$DB_USER" -p --database="$DB_NAME" \
  < deploy/mysql/migrations/V20261007__additional_attendance_fk.sql
```

The forward script uses MySQL `DELIMITER`, a stored-procedure guard, and `SIGNAL SQLSTATE '45000'`. Run through the MySQL CLI without `--force`. A null key, duplicate key, or orphan should produce a non-zero client result before either `ALTER TABLE`. A failed guard can leave the helper procedure; the next run drops it at the start.

Expected post-apply state:

- One unique constraint/index on `additional_attendance.atdnc_id`.
- An FK from `additional_attendance.atdnc_id` to `attendance.atdnc_id`, with `ON DELETE CASCADE`.
- Orphan query returns **0 rows**.
- Application smoke tests pass for extension create/update/read and parent deletion.

Record actual constraint names and staging evidence. Obtain DBA approval before production. MySQL DDL is not transactional: incompatible schema or an existing constraint may still fail during `ALTER`, potentially after an earlier `ALTER` succeeded. If equivalent constraints already exist, do not run the forward file unchanged; execute only the reviewed missing DDL and record what was applied.

### Production

Repeat preflight, approved backup, immediate pre-DDL recheck, reviewed apply, and post-apply verification in the change window. Keep the backup outside the database host and confirm a restore procedure. The rollback file only removes the specifically named constraints; use it only if those names were created. Rollback does not restore rows deleted by cascade.

**DBA deliverables:** staging preflight output, backup/restore evidence, applied constraint names, staging smoke-test result, production approval, and production verification.

## Ops Handover

### Confirm logs and collect usage

Confirm access-log location and retention on the actual Nginx host first:

```bash
sudo nginx -T 2>/dev/null | grep -E 'access_log|log_format'
```

If standard access logs are available, aggregate requests daily without storing request bodies or authorization headers:

```bash
sudo zgrep -hE '"GET /employee/(attendanceList|lastattendanceList)/' /var/log/nginx/access.log* \
  | awk '{ day=substr($4,2,11); route=$7; status=$9;
           if (route ~ /^\/employee\/attendanceList\//) name="attendanceList";
           else if (route ~ /^\/employee\/lastattendanceList\//) name="lastattendanceList";
           else next;
           print day, name, status; }' \
  | sort | uniq -c
```

Also query any API gateway/CDN logs and contact known integrations, payroll/reporting owners, and partner teams. Treat source IP as a clue only; NAT/proxies do not reliably identify a client. Retain access only as long as operationally required, restrict raw-log access, and publish aggregate counts.

**Ops deliverables:** confirm logging/retention; record the production rollout date; provide a daily aggregate across the entire usage window; identify and contact external callers; obtain client migration confirmation; and report signoff or extend the window if usage remains.

### Date policy

- Usage-window end = **production rollout date + 14 calendar days**.
- Earliest removal = **production rollout date + 15 calendar days**, after the full window and all signoffs pass.
- If rollout is 2026-10-07, the usage window ends 2026-10-21 and removal is no earlier than 2026-10-22.
- If rollout is later, update the ADR, OpenAPI deprecation text, ticket due date, and calendar event. Do not use code-edit or local-build date as the start.

## Cutover Ticket Template

**Title:** Remove deprecated attendance API routes and frontend redirects

**Owner:** HRM backend/frontend owner

**Collaborators:** Operations, DBA, external integration owners

**Status:** Blocked pending production rollout date, staging/production migration approval, full usage-window metrics, and external-client signoff.

**Due date:** No earlier than production rollout date + 15 calendar days. Confirm the date before filing; 2026-10-22 is provisional only for a 2026-10-07 rollout.

**Acceptance criteria:**

- Staging migration and smoke tests approved by DBA.
- Production schema change verified; backup and rollback evidence attached.
- Full 14-calendar-day legacy-route aggregate attached; no unresolved legacy clients.
- Remove the three deprecated methods from `EmployeeController` and their OpenAPI entries.
- Remove five legacy redirect components and their imports/routes in `App.tsx`.
- Run full backend tests, frontend build, and Redocly lint.
- Deploy, smoke-test attendance flows, and update the ADR.

**Rollback:** Redeploy the previous application build if needed. Revert FK constraints only if they were created with the migration's named identifiers; restore cascade-deleted data only through an approved recovery plan.

This is a draft for manual filing. No issue-tracker integration is configured here.

## Calendar

`calendar/attendance-legacy-route-cutover.ics` is tentative, not imported. After Ops confirms rollout, set it to rollout + 15 days, then import it into the team's calendar. For a 2026-10-07 rollout, its current 2026-10-22 date is correct.

## Team Email Draft

**Subject:** Attendance consolidation: staging DBA and 14-day Ops follow-up

Hi team,

The repository work for attendance consolidation is prepared. The centralized routes, OpenAPI validation, backend/frontend checks, rollback tag, and migration/runbook artifacts are in place. No staging or production database migration has been run, and no external-client audit has been completed from this workspace.

**DBA:** Please run the read-only staging preflight first. If duplicate/null keys or orphans are found, stop and coordinate a reviewed cleanup with the data owner. If clean, take and verify a backup, rerun preflight, apply only reviewed missing constraints, and record post-migration checks and smoke tests. The handover package is `docs/attendance-phase4-handover.md`; detailed instructions are in `docs/attendance-phase4-runbook.md`.

**Operations:** Please confirm Nginx/API gateway log coverage and retention, record the production rollout date, collect daily legacy-route counts for the full 14-calendar-day window, and contact known external clients. Do not treat the provisional removal date as final until rollout is confirmed.

The policy is: window end = rollout + 14 days; earliest removal = rollout + 15 days, subject to clean usage metrics and client signoff. Please reply with the rollout date, DBA staging approval, and Ops audit owner. The ticket and calendar event still need to be created/imported manually.

Thanks,
HRM team
