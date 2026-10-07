package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Additional_attendance;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:attendance-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none"
})
class AttendanceRepositoryTest {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void createAttendanceTable() {
        jdbcTemplate.execute("DROP TABLE IF EXISTS employee");
        jdbcTemplate.execute("DROP TABLE IF EXISTS attendance");
        jdbcTemplate.execute("CREATE TABLE employee ("
                + "emp_id BIGINT PRIMARY KEY, cmp_id BIGINT, dpt_id BIGINT)");
        jdbcTemplate.execute("CREATE TABLE attendance ("
                + "atdnc_id BIGINT AUTO_INCREMENT PRIMARY KEY, "
                + "attendance_date DATE, started_at TIMESTAMP, ended_at TIMESTAMP, emp_id BIGINT, "
                + "working_status VARCHAR(255), total_time FLOAT, attendance_status VARCHAR(255), "
                + "departure_reason VARCHAR(255), departure_notes TEXT, entry_type VARCHAR(255), "
                + "created_by VARCHAR(255), day_name VARCHAR(255), "
                + "CONSTRAINT uq_attendance_emp_date UNIQUE (emp_id, attendance_date))");
    }

    @Test
    void findByEmpIdAndAttendanceDate_shouldFindSavedAttendance() {
        LocalDate date = LocalDate.of(2026, 10, 7);
        Attendance attendance = new Attendance();
        attendance.setEmpId(24L);
        attendance.setAttendanceDate(date);
        attendance.setStartedAt(LocalDateTime.of(2026, 10, 7, 8, 30));
        attendance.setAttendance_status("PRESENT");

        Attendance saved = attendanceRepository.saveAndFlush(attendance);
        Optional<Attendance> found = attendanceRepository.findByEmpIdAndAttendanceDate(24L, date);

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getAttendance_status()).isEqualTo("PRESENT");
    }

    @Test
    void attendanceShouldEnforceOneRecordPerEmployeePerDay() {
        LocalDate date = LocalDate.of(2026, 10, 7);
        Attendance first = new Attendance();
        first.setEmpId(24L);
        first.setAttendanceDate(date);
        attendanceRepository.saveAndFlush(first);

        Attendance duplicate = new Attendance();
        duplicate.setEmpId(24L);
        duplicate.setAttendanceDate(date);

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> attendanceRepository.saveAndFlush(duplicate))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void findByAttendanceDateAndCompany_shouldScopeByCompanyAndDepartment() {
        LocalDate date = LocalDate.of(2026, 10, 7);
        jdbcTemplate.update("INSERT INTO employee (emp_id, cmp_id, dpt_id) VALUES (1, 10, 100)");
        jdbcTemplate.update("INSERT INTO employee (emp_id, cmp_id, dpt_id) VALUES (2, 20, 100)");
        jdbcTemplate.update("INSERT INTO employee (emp_id, cmp_id, dpt_id) VALUES (3, 10, 200)");
        saveAttendance(1L, date);
        saveAttendance(2L, date);
        saveAttendance(3L, date);

        List<Attendance> companyRecords =
                attendanceRepository.findByAttendanceDateAndCompany(date, 10L, null);
        List<Attendance> departmentRecords =
                attendanceRepository.findByAttendanceDateAndCompany(date, 10L, 100L);

        assertThat(companyRecords).extracting(Attendance::getEmpId).containsExactly(1L, 3L);
        assertThat(departmentRecords).extracting(Attendance::getEmpId).containsExactly(1L);
    }

    private void saveAttendance(long employeeId, LocalDate date) {
        Attendance attendance = new Attendance();
        attendance.setEmpId(employeeId);
        attendance.setAttendanceDate(date);
        attendanceRepository.saveAndFlush(attendance);
    }

            @Test
            void additionalAttendanceShouldBeMappedAsAnAttendanceExtension() throws Exception {
            OneToOne inverseRelation = Attendance.class.getDeclaredField("additional_attendance")
                .getAnnotation(OneToOne.class);
            OneToOne extensionRelation = Additional_attendance.class.getDeclaredField("attendance")
                .getAnnotation(OneToOne.class);
            JoinColumn extensionJoinColumn = Additional_attendance.class.getDeclaredField("attendance")
                .getAnnotation(JoinColumn.class);

            assertThat(inverseRelation.mappedBy()).isEqualTo("attendance");
            assertThat(extensionRelation).isNotNull();
            assertThat(extensionJoinColumn.name()).isEqualTo("atdnc_id");
            assertThat(extensionJoinColumn.referencedColumnName()).isEqualTo("atdnc_id");
            }
}
