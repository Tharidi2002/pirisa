package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.User;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CompanyAccessService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public CompanyAccessService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            EmployeeRepository employeeRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    public boolean canAccessCompany(String username, long companyId) {
        return companyId > 0 && getCompanyIdForUser(username) == companyId;
    }

    public long getCompanyIdForUser(String username) {
        if (username == null || username.isBlank()) {
            return -1;
        }

        Company company = companyRepository.findByUsername(username);
        if (company != null) {
            return company.getId();
        }

        User user = userRepository.findByUsername(username);
        if (user != null && user.getCmpId() > 0) {
            return user.getCmpId();
        }

        Employee employee = employeeRepository.findByUsername(username);
        return employee != null && employee.getCmpId() > 0
                ? employee.getCmpId()
                : -1;
    }
}
