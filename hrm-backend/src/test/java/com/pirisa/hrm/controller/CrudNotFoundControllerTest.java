package com.pirisa.hrm.controller;

import com.pirisa.hrm.model.Bonus;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.EmployeeLeave;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.service.AllowanceService;
import com.pirisa.hrm.service.BonusService;
import com.pirisa.hrm.service.CompanyOTDetailsService;
import com.pirisa.hrm.service.EmailService;
import com.pirisa.hrm.service.EmployeeLeaveRequestService;
import com.pirisa.hrm.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrudNotFoundControllerTest {
    @Mock
    private AllowanceService allowanceService;

    @Mock
    private BonusService bonusService;

    @Mock
    private CompanyOTDetailsService companyOTDetailsService;

    @Mock
    private EmployeeLeaveRequestService employeeLeaveRequestService;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AllowanceController allowanceController;

    @InjectMocks
    private BonusController bonusController;

    @InjectMocks
    private CompanyOTDetailsController companyOTDetailsController;

    @InjectMocks
    private EmployeeLeaveRequestController employeeLeaveRequestController;

    @InjectMocks
    private UserController userController;

    @Test
    void deletingMissingAllowanceReturnsNotFound() {
        when(allowanceService.deleteAllowance(25L)).thenReturn(false);

        ResponseEntity<?> response = allowanceController.deleteAllowance(25L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void updatingMissingBonusReturnsNotFound() {
        when(bonusService.updateBonus(any(Bonus.class))).thenReturn(null);

        ResponseEntity<?> response = bonusController.updateBonus(25L, new Bonus());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void missingCompanyOvertimeSettingsReturnsNotFound() {
        when(companyOTDetailsService.getCompanyOTDetailsByCompanyId(25L)).thenReturn(null);

        ResponseEntity<?> response = companyOTDetailsController.getOTDetailsByCompanyId(25L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void leaveUpdateSucceedsWhenEmployeeHasNoEmail() {
        EmployeeLeave leave = new EmployeeLeave();
        leave.setId(5L);
        leave.setEmpId(10L);
        leave.setLeaveStatus("APPROVED");
        when(employeeLeaveRequestService.updateEmployeeLeave(5L, leave)).thenReturn(leave);
        when(employeeRepository.findById(10L)).thenReturn(Optional.<Employee>empty());

        ResponseEntity<?> response = employeeLeaveRequestController.updateEmployeeLeave(5L, leave);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("emailSent")).isEqualTo(false);
        Map<?, ?> result = (Map<?, ?>) body.get("response");
        assertThat(result.get("resultCode")).isEqualTo(100);
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void deletingMissingUserReturnsNotFoundWithoutCallingDelete() {
        when(userService.getUserById(25L)).thenReturn(null);

        ResponseEntity<?> response = userController.deleteUser(25L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(userService, never()).deleteUser(25L);
    }
}
