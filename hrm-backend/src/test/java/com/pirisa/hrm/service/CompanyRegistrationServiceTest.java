package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.CompanyRegistrationRequest;
import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyRegistrationServiceTest {
    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CompanyRegistrationService registrationService;

    @Test
    void accountCreationFailureIsPropagatedInsteadOfReportedAsSuccess() {
        CompanyRegistrationRequest request = validRequest();
        Company savedCompany = new Company();
        savedCompany.setId(12L);
        when(companyRepository.findByName(request.getCmpName())).thenReturn(null);
        when(companyRepository.findByUsername(request.getUsername())).thenReturn(null);
        when(companyRepository.findByCmpEmail(request.getCmpEmail())).thenReturn(null);
        when(userRepository.findByUsername(request.getUsername())).thenReturn(null);
        when(userRepository.findByEmail(request.getCmpEmail())).thenReturn(null);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed");
        when(companyRepository.save(any(Company.class))).thenReturn(savedCompany);
        when(userRepository.save(any())).thenThrow(new IllegalStateException("user insert failed"));

        assertThatThrownBy(() -> registrationService.registerCompany(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("user insert failed");

        verify(companyRepository).save(any(Company.class));
        verify(userRepository).save(any());
    }

    @Test
    void duplicateCompanyUsernameIsRejectedBeforeSaving() {
        CompanyRegistrationRequest request = validRequest();
        when(companyRepository.findByName(request.getCmpName())).thenReturn(null);
        when(companyRepository.findByUsername(request.getUsername())).thenReturn(null);
        when(userRepository.findByUsername(request.getUsername())).thenReturn(new com.pirisa.hrm.model.User());

        assertThatThrownBy(() -> registrationService.registerCompany(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Username already exists");

        verify(companyRepository, org.mockito.Mockito.never()).save(any(Company.class));
        verify(userRepository, org.mockito.Mockito.never()).save(any());
    }

    private CompanyRegistrationRequest validRequest() {
        CompanyRegistrationRequest request = new CompanyRegistrationRequest();
        request.setCmpName("Test Company");
        request.setCmpEmail("owner@example.com");
        request.setCmpPhone("0770000000");
        request.setCmpAddress("Test address");
        request.setUsername("test-company");
        request.setPassword("Strong-password-123");
        return request;
    }
}
