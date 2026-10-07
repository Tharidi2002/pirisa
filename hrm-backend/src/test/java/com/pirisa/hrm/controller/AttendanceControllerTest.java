package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.BulkAttendanceDataDTO;
import com.pirisa.hrm.service.AttendanceService;
import com.pirisa.hrm.service.CompanyAccessService;
import com.pirisa.hrm.service.EmployeeService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AttendanceControllerTest {

    @Test
    void getAttendanceOverview_shouldReturnBulkDataAndSummary() {
        AttendanceController controller = new AttendanceController();
        AttendanceService attendanceService = mock(AttendanceService.class);
        CompanyAccessService companyAccessService = mock(CompanyAccessService.class);

        ReflectionTestUtils.setField(controller, "attendanceService", attendanceService);
        ReflectionTestUtils.setField(controller, "companyAccessService", companyAccessService);

        when(companyAccessService.canAccessCompany("admin", 5L)).thenReturn(true);
        when(attendanceService.getBulkAttendanceData(LocalDate.of(2026, 10, 7), 5L, null))
                .thenReturn(new BulkAttendanceDataDTO(Collections.emptyList(), Collections.emptyList(), Collections.emptyList()));

        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pass");

        ResponseEntity<?> response = controller.getAttendanceOverview(
                "2026-10-07",
                5L,
                null,
                authentication
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(Map.class);

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertThat(body).containsKey("attendanceData");
        assertThat(body).containsKey("summary");
    }

    @Test
    void getCompanyAttendanceList_shouldReturnCompanyAttendance_whenAccessAllowed() {
        AttendanceController controller = new AttendanceController();
        AttendanceService attendanceService = mock(AttendanceService.class);
        CompanyAccessService companyAccessService = mock(CompanyAccessService.class);
        EmployeeService employeeService = mock(EmployeeService.class);

        ReflectionTestUtils.setField(controller, "attendanceService", attendanceService);
        ReflectionTestUtils.setField(controller, "companyAccessService", companyAccessService);
        ReflectionTestUtils.setField(controller, "employeeService", employeeService);

        when(companyAccessService.canAccessCompany("admin", 5L)).thenReturn(true);
        when(employeeService.getAttendanceByCompanyId(5L)).thenReturn(Collections.emptyList());

        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pass");

        ResponseEntity<?> response = controller.getCompanyAttendanceList(5L, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getAttendanceOverview_shouldRejectAccess_whenCompanyAccessDenied() {
        AttendanceController controller = new AttendanceController();
        AttendanceService attendanceService = mock(AttendanceService.class);
        CompanyAccessService companyAccessService = mock(CompanyAccessService.class);

        ReflectionTestUtils.setField(controller, "attendanceService", attendanceService);
        ReflectionTestUtils.setField(controller, "companyAccessService", companyAccessService);

        when(companyAccessService.canAccessCompany("admin", 5L)).thenReturn(false);

        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pass");

        ResponseEntity<?> response = controller.getAttendanceOverview(
                "2026-10-07",
                5L,
                null,
                authentication
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void getCompanyAttendanceByMonth_shouldReturnMonthlyCompanyData() {
        AttendanceController controller = new AttendanceController();
        AttendanceService attendanceService = mock(AttendanceService.class);
        CompanyAccessService companyAccessService = mock(CompanyAccessService.class);
        EmployeeService employeeService = mock(EmployeeService.class);

        ReflectionTestUtils.setField(controller, "attendanceService", attendanceService);
        ReflectionTestUtils.setField(controller, "companyAccessService", companyAccessService);
        ReflectionTestUtils.setField(controller, "employeeService", employeeService);
        when(companyAccessService.canAccessCompany("admin", 5L)).thenReturn(true);
        when(employeeService.getAttendanceByCompanyIdAndMonth(5L, 10)).thenReturn(Collections.emptyList());

        Authentication authentication = new UsernamePasswordAuthenticationToken("admin", "pass");
        ResponseEntity<?> response = controller.getCompanyAttendanceByMonth(5L, 10, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(employeeService).getAttendanceByCompanyIdAndMonth(5L, 10);
    }

    @Test
    void getCompanyAttendanceByMonth_shouldRejectInvalidMonth() {
        AttendanceController controller = new AttendanceController();

        ResponseEntity<?> response = controller.getCompanyAttendanceByMonth(
                5L,
                13,
                new UsernamePasswordAuthenticationToken("admin", "pass"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
