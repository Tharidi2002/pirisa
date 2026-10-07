package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceValidatorTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private AttendanceValidator attendanceValidator;

    @Test
    void validateAttendanceJoinDate_shouldAllowDateOnOrAfterJoining() {
        Employee employee = new Employee();
        employee.setId(21L);
        employee.setEpfNo("EPF-021");
        employee.setDateOfJoining("2026-01-01");
        when(employeeRepository.findById(21L)).thenReturn(Optional.of(employee));

        Attendance attendance = new Attendance();
        attendance.setEmpId(21L);
        attendance.setAttendanceDate(LocalDate.of(2026, 1, 1));

        assertThatCode(() -> attendanceValidator.validateAttendanceJoinDate(attendance, employeeRepository))
                .doesNotThrowAnyException();
    }

    @Test
    void validateAttendanceJoinDate_shouldRejectDateBeforeJoining() {
        Employee employee = new Employee();
        employee.setId(21L);
        employee.setEpfNo("EPF-021");
        employee.setDateOfJoining("2026-01-02");
        when(employeeRepository.findById(21L)).thenReturn(Optional.of(employee));

        Attendance attendance = new Attendance();
        attendance.setEmpId(21L);
        attendance.setAttendanceDate(LocalDate.of(2026, 1, 1));

        assertThatThrownBy(() -> attendanceValidator.validateAttendanceJoinDate(attendance, employeeRepository))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prior to the join date");
    }

    @Test
    void validateAttendanceJoinDate_shouldRejectMissingEmployee() {
        when(employeeRepository.findById(21L)).thenReturn(Optional.empty());

        Attendance attendance = new Attendance();
        attendance.setEmpId(21L);
        attendance.setAttendanceDate(LocalDate.of(2026, 1, 1));

        assertThatThrownBy(() -> attendanceValidator.validateAttendanceJoinDate(attendance, employeeRepository))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("employee not found");
    }
}
