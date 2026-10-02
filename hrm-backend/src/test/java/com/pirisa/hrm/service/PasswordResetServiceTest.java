package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.User;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {
    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @Test
    void failedEmailDeliveryDoesNotChangeAnyAccountPassword() {
        String email = "owner@example.com";
        Company company = new Company();
        company.setCmpEmail(email);
        company.setCmp_password("old-company-hash");
        User user = new User();
        user.setEmail(email);
        user.setPassword("old-user-hash");
        when(companyRepository.findByCmpEmail(email)).thenReturn(company);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(employeeRepository.findByEmail(email)).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("new-hash");
        when(emailService.sendEmail(anyString(), anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> passwordResetService.resetPasswordForEmail(email))
                .isInstanceOf(PasswordResetService.DeliveryException.class);

        org.assertj.core.api.Assertions.assertThat(company.getCmp_password()).isEqualTo("old-company-hash");
        org.assertj.core.api.Assertions.assertThat(user.getPassword()).isEqualTo("old-user-hash");
        verify(companyRepository, never()).save(company);
        verify(userRepository, never()).save(user);
    }

    @Test
    void successfulResetUpdatesCompanyAndItsLinkedUserTogether() {
        String email = "owner@example.com";
        Company company = new Company();
        company.setCmpEmail(email);
        User user = new User();
        user.setEmail(email);
        when(companyRepository.findByCmpEmail(email)).thenReturn(company);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(employeeRepository.findByEmail(email)).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("shared-new-hash");
        when(emailService.sendEmail(anyString(), anyString(), anyString())).thenReturn(true);

        passwordResetService.resetPasswordForEmail(email);

        verify(companyRepository).save(company);
        verify(userRepository).save(user);
        org.assertj.core.api.Assertions.assertThat(company.getCmp_password()).isEqualTo("shared-new-hash");
        org.assertj.core.api.Assertions.assertThat(user.getPassword()).isEqualTo("shared-new-hash");
    }

    @Test
    void smtpAuthenticationExceptionDoesNotChangePassword() {
        String email = "owner@example.com";
        User user = new User();
        user.setEmail(email);
        user.setPassword("old-user-hash");
        when(companyRepository.findByCmpEmail(email)).thenReturn(null);
        when(userRepository.findByEmail(email)).thenReturn(user);
        when(employeeRepository.findByEmail(email)).thenReturn(null);
        when(passwordEncoder.encode(anyString())).thenReturn("new-hash");
        when(emailService.sendEmail(anyString(), anyString(), anyString()))
                .thenThrow(new MailAuthenticationException("SMTP authentication failed"));

        assertThatThrownBy(() -> passwordResetService.resetPasswordForEmail(email))
                .isInstanceOf(PasswordResetService.DeliveryException.class)
                .hasMessageContaining("password was not changed");

        org.assertj.core.api.Assertions.assertThat(user.getPassword()).isEqualTo("old-user-hash");
        verify(userRepository, never()).save(user);
    }
}
