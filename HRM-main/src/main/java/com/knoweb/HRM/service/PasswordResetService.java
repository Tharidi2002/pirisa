package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.model.Employee;
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

    @Autowired
    private EmailService emailService;

    public void initiatePasswordResetForCompany(String email) {
        Company company = companyRepository.findByCmpEmail(email);
        if (company != null) {
            String token = UUID.randomUUID().toString();
            // In a real application, you would save this token with an expiry date
            // and associate it with the company.

            String resetLink = "http://yourfrontend.com/reset-password?token=" + token;

            emailService.sendEmail(
                    company.getCmpEmail(),
                    "Password Reset Request",
                    "To reset your password, click the link below:\n" + resetLink
            );
        }
    }

    public void resetCompanyPassword(String token, String newPassword) {
        // In a real app, you'd find the user by the token, check expiry, etc.
        // For this example, let's assume the token is valid and we get the company.
        Company company = companyRepository.findByCmpEmail("some-email@example.com"); // Placeholder
        if (company != null) {
            company.setCmpPassword(passwordEncoder.encode(newPassword));
            companyRepository.save(company);
        }
    }

    public void initiatePasswordResetForEmployee(String email) {
        Employee employee = employeeRepository.findByEmail(email);
        if (employee != null) {
            String token = UUID.randomUUID().toString();

            String resetLink = "http://yourfrontend.com/reset-password?token=" + token;

            emailService.sendEmail(
                    employee.getEmail(),
                    "Password Reset Request",
                    "To reset your password, click the link below:\n" + resetLink
            );
        }
    }

    public void resetEmployeePassword(String token, String newPassword) {
        // Similar to company, find employee by token
        Employee employee = employeeRepository.findByEmail("some-employee@example.com"); // Placeholder
        if (employee != null) {
            employee.setPassword(passwordEncoder.encode(newPassword));
            employeeRepository.save(employee);
        }
    }
}
