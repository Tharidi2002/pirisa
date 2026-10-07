-- Read-only preflight. Run this separately and inspect every result set before
-- taking the migration backup or running V20261007__additional_attendance_fk.sql.
-- The physical key is atdnc_id in both tables (not attendance_id or id).

SHOW CREATE TABLE attendance;
SHOW CREATE TABLE additional_attendance;
SHOW INDEX FROM additional_attendance WHERE Column_name = 'atdnc_id';

SELECT tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE, kcu.COLUMN_NAME,
       kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
FROM information_schema.TABLE_CONSTRAINTS tc
JOIN information_schema.KEY_COLUMN_USAGE kcu
  ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
 AND kcu.TABLE_NAME = tc.TABLE_NAME
 AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
  AND tc.TABLE_NAME = 'additional_attendance'
  AND kcu.COLUMN_NAME = 'atdnc_id';

SELECT atdnc_id, COUNT(*) AS record_count
FROM additional_attendance
GROUP BY atdnc_id
HAVING atdnc_id IS NULL OR COUNT(*) > 1;

SELECT aa.additional_atdnc_id, aa.atdnc_id
FROM additional_attendance aa
LEFT JOIN attendance a ON a.atdnc_id = aa.atdnc_id
WHERE a.atdnc_id IS NULL;
