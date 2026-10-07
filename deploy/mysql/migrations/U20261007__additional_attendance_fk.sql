-- Rollback for V20261007__additional_attendance_fk.sql.
DROP PROCEDURE IF EXISTS assert_additional_attendance_fk_preconditions;

ALTER TABLE additional_attendance
    DROP FOREIGN KEY fk_additional_attendance_attendance;

ALTER TABLE additional_attendance
    DROP INDEX uq_additional_attendance_atdnc_id;
