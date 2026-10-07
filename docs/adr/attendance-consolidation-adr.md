# ADR: Attendance domain consolidation

## Status

Accepted; 14-day usage window ends production rollout date + 14 calendar days; removal is no earlier than rollout date + 15 calendar days (2026-10-22 only if rollout is 2026-10-07)

## Context

The attendance domain had multiple entry points across the frontend and backend. Company-level attendance reads were split between the employee and attendance APIs, and the extra attendance table existed as a parallel extension with its own controller and service.

This split created duplicate business logic and made the system harder to reason about during audits, reporting, and employee self-service flows.

## Decision

We moved the admin/company attendance access into the single attendance controller and kept self-service attendance in the employee-owned controller.

We also treated `Additional_attendance` as an extension to the main attendance record, not as a second parallel attendance domain. The JPA mapping now makes `Attendance` the inverse side and `Additional_attendance.atdnc_id` the extension key. JSON serialization ignores the bidirectional relation. A manual database migration adds the unique key and foreign key after data preflight.

We split the responsibilities inside `AttendanceService` into:

- `AttendanceService`: orchestration and CRUD entry points
- `AttendanceReportService`: bulk attendance summaries and company-level reporting data
- `AttendanceImportExportService`: Excel import/export behavior
- `AttendanceValidator`: attendance validity rules, especially employee join-date validation

## Consequences

Positive:

- one source of truth for core attendance operations
- cleaner controller responsibilities
- easier test coverage and maintenance
- safer compatibility path for legacy URLs

Negative:

- some legacy employee routes still remain as compatibility wrappers during the migration window
- legacy employee routes are deprecated through the end of production rollout date + 14 calendar days; removal is no earlier than the following day. All in-repository frontend callers use the centralized routes
- legacy frontend paths remain as warning redirects until the compatibility window ends
- the database migration is manual because the project has Hibernate `ddl-auto=update` but no migration runner; deployment must verify existing data and constraints first

## Rollback plan

If the new structure causes regressions:

1. redeploy the previous application build or revert the application commit
2. re-enable the old frontend API paths only if a prior frontend build requires them
3. do not roll back the FK migration unless application rollback requires it; if needed, run `deploy/mysql/migrations/U20261007__additional_attendance_fk.sql`
4. run the attendance controller, service, self-service, import/export, and repository tests before redeploying

The annotated tag `pre-attendance-consolidation` was created and pushed to `origin` at commit `e13ef04` (`fix: restrict attendance data to authenticated company`). It points to committed code before the attendance consolidation; it does not include any uncommitted worktree changes.

## Compatibility schedule

- Production rollout date: pending Ops confirmation; this starts the 14-calendar-day deprecation window
- Usage-window end: production rollout date + 14 calendar days; 2026-10-21 is provisional only if rollout is 2026-10-07
- Earliest removal: production rollout date + 15 calendar days; 2026-10-22 is provisional only if rollout is 2026-10-07
- Remove the three `/employee/attendanceList...` routes and five redirect components only after the confirmed window and external-client/deep-link checks pass
