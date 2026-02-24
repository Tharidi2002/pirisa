package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CompanyRegistrationService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public String registerCompany(Company company) {
        // Encrypt the password before saving
        company.setCmpPassword(passwordEncoder.encode(company.getCmpPassword()));
        companyRepository.save(company);

        // Send a confirmation email
        String subject = "Welcome to Our Platform!";
        String body = String.format(
                "Hello %s,\n\nThank you for registering with us. Your account has been created successfully.",
                company.getCmpName()
        );
        emailService.sendEmail(company.getCmpEmail(), subject, body);

        return "SUCCESS";
    }

    public Company updateCompany(Long id, Company updatedCompany) {
        Optional<Company> existingCompanyOpt = companyRepository.findById(id);
        if (existingCompanyOpt.isPresent()) {
            Company existingCompany = existingCompanyOpt.get();
            existingCompany.setCmpName(updatedCompany.getCmpName());
            existingCompany.setCmpPhone(updatedCompany.getCmpPhone());
            existingCompany.setCmpAddress(updatedCompany.getCmpAddress());
            existingCompany.setCompanyStatus(updatedCompany.getCompanyStatus());

            // You may want to handle other fields as well

            return companyRepository.save(existingCompany);
        } else {
            // Handle the case where the company is not found
            throw new RuntimeException("Company not found with id: " + id);
        }
    }

    public boolean isUsernameAvailable(String username) {
        return companyRepository.existsByUsername(username);
    }

    public boolean isEmailAvailable(String email) {
        return companyRepository.existsByCmpEmail(email);
    }
}
