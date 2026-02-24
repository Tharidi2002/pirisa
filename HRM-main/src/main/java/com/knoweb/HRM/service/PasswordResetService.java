package com.knoweb.HRM.service;

import com.knoweb.HRM.exception.NotFoundException;
import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.model.User;
import com.knoweb.HRM.repository.CompanyRepository;
import com.knoweb.HRM.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User resetPasswordFor(String identifier) throws NotFoundException {
        // Try to find a company first
        Company company = companyRepository.findByUsername(identifier);
        if (company != null) {
            String newPassword = generateRandomPassword();
            company.setCmpPassword(passwordEncoder.encode(newPassword));
            companyRepository.save(company);
            return new User(company.getUsername(), newPassword, company.getCmpEmail());
        }

        // If not a company, try to find an employee
        Employee employee = employeeRepository.findByUsername(identifier);
        if (employee != null) {
            String newPassword = generateRandomPassword();
            employee.setPassword(passwordEncoder.encode(newPassword));
            employeeRepository.save(employee);
            return new User(employee.getUsername(), newPassword, employee.getEmail());
        }

        throw new NotFoundException("User with identifier '" + identifier + "' not found.");
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
