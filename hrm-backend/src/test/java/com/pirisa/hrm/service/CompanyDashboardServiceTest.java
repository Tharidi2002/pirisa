package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.CompanyDashboardSummaryDTO;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeLeaveRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyDashboardServiceTest {
    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeLeaveRepository employeeLeaveRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @InjectMocks
    private CompanyDashboardService dashboardService;

    @Test
    void getSummary_aggregatesCompanyMetricsAndDepartmentHeadcount() {
        long companyId = 12L;
        LocalDate today = LocalDate.now();
        Employee employee = new Employee();
        employee.setId(7L);
        employee.setFirstName("Maya");
        employee.setLastName("Perera");
        employee.setStatus("ACTIVE");
        employee.setDateOfJoining(today.withDayOfMonth(1).toString());
        Unit department = new Unit();
        department.setDptName("People Operations");
        employee.setDepartment(department);

        Attendance attendance = new Attendance();
        attendance.setId(21L);
        attendance.setEmpId(employee.getId());
        attendance.setAttendanceDate(today);
        attendance.setStartedAt(LocalDateTime.now().minusHours(1));
        attendance.setAttendance_status("PRESENT");

        when(employeeRepository.findEmployeesByCompanyIdWithDetails(companyId))
                .thenReturn(List.of(employee));
        when(employeeLeaveRepository.countByLeaveStatusAndCompanyId("PENDING", companyId))
                .thenReturn(2L);
        when(attendanceRepository.findForCompanyBetweenDates(
                eq(companyId), eq(today.minusDays(29)), eq(today), any(LocalDateTime.class),
                any(LocalDateTime.class)))
                .thenReturn(List.of(attendance));

        CompanyDashboardSummaryDTO summary = dashboardService.getSummary(companyId);

        assertThat(summary.getTotalEmployees()).isEqualTo(1);
        assertThat(summary.getActiveEmployees()).isEqualTo(1);
        assertThat(summary.getPresentToday()).isEqualTo(1);
        assertThat(summary.getPendingLeaves()).isEqualTo(2);
        assertThat(summary.getNewHiresThisMonth()).isEqualTo(1);
        assertThat(summary.getDepartmentHeadcount())
                .extracting(CompanyDashboardSummaryDTO.DepartmentHeadcount::getDepartment)
                .containsExactly("People Operations");
        assertThat(summary.getRecentActivity()).hasSize(2);

        verify(employeeRepository).findEmployeesByCompanyIdWithDetails(companyId);
    }
}