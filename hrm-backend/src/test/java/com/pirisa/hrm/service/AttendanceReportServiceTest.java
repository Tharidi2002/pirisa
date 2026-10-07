package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.BulkAttendanceDataDTO;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceReportServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AttendanceValidator attendanceValidator;

    @InjectMocks
    private AttendanceReportService attendanceReportService;

    @Test
    void getBulkAttendanceData_shouldSeparatePendingAttendedAndExcludedEmployees() {
        LocalDate date = LocalDate.of(2026, 10, 7);
        Employee pending = employee(1L, "2025-01-01");
        Employee excluded = employee(2L, "2026-10-08");
        Employee attended = employee(3L, "2025-01-01");
        Attendance record = new Attendance();
        record.setId(30L);
        record.setEmpId(3L);
        record.setAttendanceDate(date);
        record.setStartedAt(LocalDateTime.of(2026, 10, 7, 8, 30));
        record.setAttendance_status("PRESENT");

        when(employeeRepository.findEmployeesByCompanyIdWithDetails(5L))
                .thenReturn(List.of(pending, excluded, attended));
        when(attendanceRepository.findByAttendanceDateAndCompany(date, 5L, null)).thenReturn(List.of(record));
        when(attendanceValidator.parseEmployeeJoinDate("2025-01-01"))
                .thenReturn(LocalDate.of(2025, 1, 1));
        when(attendanceValidator.parseEmployeeJoinDate("2026-10-08"))
                .thenReturn(LocalDate.of(2026, 10, 8));

        BulkAttendanceDataDTO result = attendanceReportService.getBulkAttendanceData(date, 5L, null);

        assertThat(result.getPendingEmployees()).extracting("id").containsExactly(1L);
        assertThat(result.getExcludedEmployees()).extracting("id").containsExactly(2L);
        assertThat(result.getAttendedEmployees()).extracting("empId").containsExactly(3L);
        assertThat(result.getAttendedEmployees().get(0).getClockInTime()).isEqualTo("08:30");
        assertThat(result.getAttendedEmployees().get(0).getClockOutTime()).isEmpty();
    }

    @Test
    void getBulkAttendanceData_shouldApplyDepartmentFilterToPendingEmployees() {
        LocalDate date = LocalDate.of(2026, 10, 7);
        Employee employee = employee(1L, "2025-01-01");
        employee.setDptId(9L);
        when(employeeRepository.findEmployeesByCompanyIdWithDetails(5L)).thenReturn(List.of(employee));
        when(attendanceRepository.findByAttendanceDateAndCompany(date, 5L, 9L)).thenReturn(List.of());
        when(attendanceValidator.parseEmployeeJoinDate("2025-01-01"))
                .thenReturn(LocalDate.of(2025, 1, 1));

        BulkAttendanceDataDTO result = attendanceReportService.getBulkAttendanceData(date, 5L, 9L);

        assertThat(result.getPendingEmployees()).extracting("id").containsExactly(1L);
        assertThat(result.getAttendedEmployees()).isEmpty();
    }

    @Test
    void getBulkAttendanceData_shouldIncludeEmployeeWithoutJoinDateAsPending() {
        LocalDate date = LocalDate.of(2026, 10, 7);
        Employee employee = employee(4L, null);
        when(employeeRepository.findEmployeesByCompanyIdWithDetails(5L)).thenReturn(List.of(employee));
        when(attendanceRepository.findByAttendanceDateAndCompany(date, 5L, null)).thenReturn(List.of());
        when(attendanceValidator.parseEmployeeJoinDate(null)).thenReturn(null);

        BulkAttendanceDataDTO result = attendanceReportService.getBulkAttendanceData(date, 5L, null);

        assertThat(result.getPendingEmployees()).extracting("id").containsExactly(4L);
        assertThat(result.getExcludedEmployees()).isEmpty();
    }

    private Employee employee(Long id, String joiningDate) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setEpfNo("EPF-" + id);
        employee.setFirstName("Employee");
        employee.setLastName(String.valueOf(id));
        employee.setDateOfJoining(joiningDate);
        return employee;
    }
}
