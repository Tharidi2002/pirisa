-- Manual migration; this project has no Flyway/Liquibase runner.
-- Run P20261007__additional_attendance_fk_preflight.sql first and inspect its
-- output. This migration repeats the data checks and aborts before any DDL if
-- duplicate/null keys or orphan rows exist. MySQL DDL is not transactional;
-- inspect existing equivalent constraints and apply only missing ALTERs.

DROP PROCEDURE IF EXISTS assert_additional_attendance_fk_preconditions;

DELIMITER //
CREATE PROCEDURE assert_additional_attendance_fk_preconditions()
BEGIN
    DECLARE duplicate_key_count BIGINT DEFAULT 0;
    DECLARE null_key_count BIGINT DEFAULT 0;
    DECLARE orphan_count BIGINT DEFAULT 0;

    SELECT COUNT(*) INTO null_key_count
    FROM additional_attendance
    WHERE atdnc_id IS NULL;

    IF null_key_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Attendance FK migration aborted: null additional_attendance.atdnc_id values exist';
    END IF;

    SELECT COUNT(*) INTO duplicate_key_count
    FROM (
        SELECT atdnc_id
        FROM additional_attendance
        GROUP BY atdnc_id
        HAVING COUNT(*) > 1
    ) duplicate_keys;

    IF duplicate_key_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Attendance FK migration aborted: duplicate additional_attendance.atdnc_id values exist';
    END IF;

    SELECT COUNT(*) INTO orphan_count
    FROM additional_attendance aa
    LEFT JOIN attendance a ON a.atdnc_id = aa.atdnc_id
    WHERE a.atdnc_id IS NULL;

    IF orphan_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Attendance FK migration aborted: orphan additional_attendance rows exist';
    END IF;
END//
DELIMITER ;

CALL assert_additional_attendance_fk_preconditions();
DROP PROCEDURE assert_additional_attendance_fk_preconditions;

ALTER TABLE additional_attendance
    ADD CONSTRAINT uq_additional_attendance_atdnc_id UNIQUE (atdnc_id);

ALTER TABLE additional_attendance
    ADD CONSTRAINT fk_additional_attendance_attendance
    FOREIGN KEY (atdnc_id) REFERENCES attendance (atdnc_id)
    ON DELETE CASCADE;
