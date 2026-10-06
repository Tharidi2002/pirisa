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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyAccessServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private CompanyAccessService companyAccessService;

    @Test
    void companyAccountCanAccessOnlyItsOwnCompany() {
        Company company = new Company();
        company.setId(12L);
        when(companyRepository.findByUsername("company-admin")).thenReturn(company);

        assertThat(companyAccessService.canAccessCompany("company-admin", 12L)).isTrue();
        assertThat(companyAccessService.canAccessCompany("company-admin", 13L)).isFalse();
    }

    @Test
    void companyUserAndEmployeeResolveToTheirAssignedCompany() {
        User user = new User();
        user.setCmpId(21L);
        when(userRepository.findByUsername("hr-user")).thenReturn(user);

        Employee employee = new Employee();
        employee.setCmpId(34L);
        when(employeeRepository.findByUsername("employee-user")).thenReturn(employee);

        assertThat(companyAccessService.canAccessCompany("hr-user", 21L)).isTrue();
        assertThat(companyAccessService.canAccessCompany("employee-user", 34L)).isTrue();
    }

    @Test
    void unknownUserCannotAccessAnyCompany() {
        assertThat(companyAccessService.canAccessCompany("unknown", 12L)).isFalse();
        assertThat(companyAccessService.canAccessCompany(null, 12L)).isFalse();
    }
}
