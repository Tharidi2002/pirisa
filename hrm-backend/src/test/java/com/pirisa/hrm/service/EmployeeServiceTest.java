package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.EmployeeCreationResult;
import com.pirisa.hrm.dto.PayroleEmployeeDTO;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.Payrole;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.PayroleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.Collections;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {
    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PayroleRepository payroleRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void createEmployeeKeepsEmployeeWhenWelcomeEmailCannotBeSent() {
        Employee employee = validEmployee("maya@example.com");
        when(passwordEncoder.encode(any())).thenReturn("hashed-password");
        when(employeeRepository.findAllEmpNos()).thenReturn(Collections.emptyList());
        when(employeeRepository.findAllEpfNos()).thenReturn(Collections.emptyList());
        when(employeeRepository.count()).thenReturn(0L);
        when(employeeRepository.save(employee)).thenReturn(employee);
        org.mockito.Mockito.doThrow(new MailAuthenticationException("SMTP authentication failed"))
                .when(emailService)
                .sendEmail(any(), any(), any());

        EmployeeCreationResult result = employeeService.createEmployee(employee);

        assertThat(result.getEmployee()).isSameAs(employee);
        assertThat(result.isEmailSent()).isFalse();
        verify(employeeRepository).save(employee);
    }

    @Test
    void createEmployeeRejectsMalformedEmailBeforeSaving() {
        Employee employee = validEmployee("not-an-email");

        assertThatThrownBy(() -> employeeService.createEmployee(employee))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Please enter a valid email address.");

        verify(employeeRepository, never()).save(any(Employee.class));
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void createEmployeeRejectsEmailAlreadyUsedAsEmployeeUsername() {
        Employee employee = validEmployee("maya@example.com");
        when(employeeRepository.existsByEmailIgnoreCase("maya@example.com")).thenReturn(false);
        when(employeeRepository.existsByUsernameIgnoreCase("maya@example.com")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.createEmployee(employee))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("account with this email address already exists");

        verify(employeeRepository, never()).save(any(Employee.class));
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void createEmployeeUsesBackendAllocatedNumbersInsteadOfStaleFormPreview() {
        Employee employee = validEmployee("maya@example.com");
        employee.setEmpNo("EMP0001");
        employee.setEpfNo("EPF0001");
        when(passwordEncoder.encode(any())).thenReturn("hashed-password");
        when(employeeRepository.findAllEmpNos()).thenReturn(java.util.Collections.singletonList("EMP0002"));
        when(employeeRepository.findAllEpfNos()).thenReturn(java.util.Collections.singletonList("EPF0003"));
        when(employeeRepository.count()).thenReturn(2L);
        when(employeeRepository.save(employee)).thenReturn(employee);
        when(emailService.sendEmail(any(), any(), any())).thenReturn(true);

        employeeService.createEmployee(employee);

        assertThat(employee.getEmpNo()).isEqualTo("EMP0003");
        assertThat(employee.getEpfNo()).isEqualTo("EPF0004");
    }

    @Test
    void getPayroleByEmployeeIdLoadsPayrolesFromPayroleRepository() {
        Employee employee = validEmployee("maya@example.com");
        employee.setId(1L);
        Payrole payrole = payrole(6L, 1L);
        when(employeeRepository.findEmployeeById(1L)).thenReturn(Collections.singletonList(employee));
        when(payroleRepository.findByEmpId(1L)).thenReturn(Collections.singletonList(payrole));

        List<PayroleEmployeeDTO> result = employeeService.getPayroleByEmployeeId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPayroleList()).hasSize(1);
        assertThat(result.get(0).getPayroleList().get(0).getId()).isEqualTo(6L);
        verify(payroleRepository).findByEmpId(1L);
    }

    @Test
    void getPayroleByCompanyIdLoadsPayrolesForEachEmployeeFromPayroleRepository() {
        Employee employee = validEmployee("maya@example.com");
        employee.setId(1L);
        Payrole payrole = payrole(6L, 1L);
        when(employeeRepository.findByCmpId(10L)).thenReturn(Collections.singletonList(employee));
        when(payroleRepository.findByEmpId(1L)).thenReturn(Collections.singletonList(payrole));

        List<PayroleEmployeeDTO> result = employeeService.getPayroleByCompanyId(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPayroleList()).hasSize(1);
        assertThat(result.get(0).getPayroleList().get(0).getId()).isEqualTo(6L);
        verify(payroleRepository).findByEmpId(1L);
    }

    private Employee validEmployee(String email) {
        Employee employee = new Employee();
        employee.setEmail(email);
        employee.setEmpNo("EMP0001");
        employee.setEpfNo("EPF0001");
        employee.setFirstName("Maya");
        return employee;
    }

    private Payrole payrole(long id, long employeeId) {
        Payrole payrole = new Payrole();
        payrole.setId(id);
        payrole.setEmpId(employeeId);
        return payrole;
    }
}
