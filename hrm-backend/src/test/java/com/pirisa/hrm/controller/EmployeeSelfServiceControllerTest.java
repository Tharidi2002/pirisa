package com.pirisa.hrm.controller;

import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.service.EmployeeSelfServiceService;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmployeeSelfServiceControllerTest {

    @Test
    void getMyAttendanceHistory_shouldReturnHistoryForAuthenticatedEmployee() {
        EmployeeSelfServiceController controller = new EmployeeSelfServiceController();
        EmployeeSelfServiceService selfService = mock(EmployeeSelfServiceService.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        Employee employee = employee(12L, "employee@example.com");

        ReflectionTestUtils.setField(controller, "selfService", selfService);
        ReflectionTestUtils.setField(controller, "employeeRepository", employeeRepository);
        when(employeeRepository.findByUsername("employee@example.com")).thenReturn(employee);
        when(selfService.getMyAttendanceHistory(12L, 10, 2026)).thenReturn(Collections.emptyList());

        Authentication authentication = new UsernamePasswordAuthenticationToken("employee@example.com", "token");

        var response = controller.getMyAttendanceHistory(12L, 10, 2026, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(selfService).getMyAttendanceHistory(12L, 10, 2026);
    }

    @Test
    void getMyAttendanceHistory_shouldRejectAnotherEmployeesId() {
        EmployeeSelfServiceController controller = new EmployeeSelfServiceController();
        EmployeeSelfServiceService selfService = mock(EmployeeSelfServiceService.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        Employee employee = employee(12L, "employee@example.com");

        ReflectionTestUtils.setField(controller, "selfService", selfService);
        ReflectionTestUtils.setField(controller, "employeeRepository", employeeRepository);
        when(employeeRepository.findByUsername("employee@example.com")).thenReturn(employee);

        Authentication authentication = new UsernamePasswordAuthenticationToken("employee@example.com", "token");

        var response = controller.getMyAttendanceHistory(99L, 10, 2026, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(selfService, never()).getMyAttendanceHistory(99L, 10, 2026);
    }

    @Test
    void getMyAttendanceHistory_shouldRejectPrincipalWithoutEmployeeRecord() {
        EmployeeSelfServiceController controller = new EmployeeSelfServiceController();
        EmployeeSelfServiceService selfService = mock(EmployeeSelfServiceService.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);

        ReflectionTestUtils.setField(controller, "selfService", selfService);
        ReflectionTestUtils.setField(controller, "employeeRepository", employeeRepository);
        when(employeeRepository.findByUsername("company-user")).thenReturn(null);

        Authentication authentication = new UsernamePasswordAuthenticationToken("company-user", "token");

        var response = controller.getMyAttendanceHistory(12L, null, null, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(selfService, never()).getMyAttendanceHistory(12L, null, null);
    }

    @Test
    void getMyMissingPunchRequests_shouldRejectAnotherEmployeesId() {
        EmployeeSelfServiceController controller = new EmployeeSelfServiceController();
        EmployeeSelfServiceService selfService = mock(EmployeeSelfServiceService.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        ReflectionTestUtils.setField(controller, "selfService", selfService);
        ReflectionTestUtils.setField(controller, "employeeRepository", employeeRepository);
        when(employeeRepository.findByUsername("employee@example.com"))
                .thenReturn(employee(12L, "employee@example.com"));

        Authentication authentication = new UsernamePasswordAuthenticationToken("employee@example.com", "token");

        var response = controller.getMyMissingPunchRequests(99L, authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(selfService, never()).getMyMissingPunchRequests(99L);
    }

    private Employee employee(Long id, String username) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setUsername(username);
        return employee;
    }
}
