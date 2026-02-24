package com.knoweb.HRM.service;

import com.knoweb.HRM.dto.CompanyDetailsDTO;
import com.knoweb.HRM.exception.ResourceNotFoundException;
import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.repository.CompanyRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Use PasswordEncoder directly

    @Autowired
    private EmailService emailService;

    @Autowired
    private ModelMapper modelMapper;

    // --- DTO Conversion Methods ---

    private CompanyDetailsDTO convertToDto(Company company) {
        return modelMapper.map(company, CompanyDetailsDTO.class);
    }

    private Company convertToEntity(CompanyDetailsDTO dto) {
        return modelMapper.map(dto, Company.class);
    }

    // --- Service Methods ---

    public List<CompanyDetailsDTO> getAllCompaniesDetails() {
        List<Company> companies = companyRepository.findAll();
        return companies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CompanyDetailsDTO getCompanyDetailsById(long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));
        return convertToDto(company);
    }

    public CompanyDetailsDTO updateCompany(Long companyId, CompanyDetailsDTO companyDetailsDTO) {
        // Fetch the existing company
        Company existingCompany = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        // Update fields from DTO
        existingCompany.setCmpName(companyDetailsDTO.getCmpName());
        existingCompany.setCmpAddress(companyDetailsDTO.getCmpAddress());
        existingCompany.setCmpPhone(companyDetailsDTO.getCmpPhone());
        existingCompany.setCmpEmail(companyDetailsDTO.getCmpEmail());
        existingCompany.setUsername(companyDetailsDTO.getUsername());
        existingCompany.setCmpRegNo(companyDetailsDTO.getCmpRegNo());
        existingCompany.setTinNo(companyDetailsDTO.getTinNo());
        existingCompany.setVatNo(companyDetailsDTO.getVatNo());
        existingCompany.setPackageName(companyDetailsDTO.getPackageName());
        existingCompany.setCompanyStatus(companyDetailsDTO.getCompanyStatus());

        // Save the updated entity
        Company updatedCompany = companyRepository.save(existingCompany);
        return convertToDto(updatedCompany);
    }

    public void changeCompanyPassword(Long cmpId, String oldPassword, String newPassword) {
        Company company = companyRepository.findById(cmpId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", cmpId));

        if (!passwordEncoder.matches(oldPassword, company.getCmpPassword())) {
            throw new IllegalArgumentException("Incorrect old password.");
        }

        company.setCmpPassword(passwordEncoder.encode(newPassword));
        companyRepository.save(company);
    }

    public void forgotPassword(String cmpEmail) {
        Company company = companyRepository.findByCmpEmail(cmpEmail);
        if (company == null) {
            throw new ResourceNotFoundException("Company", "email", cmpEmail);
        }

        String randomPassword = UUID.randomUUID().toString().substring(0, 8);
        company.setCmpPassword(passwordEncoder.encode(randomPassword));
        companyRepository.save(company);

        // Prepare and send email
        String subject = "Password Reset Request";
        String content = String.format("<p>Your password has been reset successfully.</p>" +
                "<p>Your new password is: <strong>%s</strong></p>" +
                "<p>Please log in and change your password as soon as possible.</p>", randomPassword);

        emailService.sendEmail(cmpEmail, subject, content);
    }

    // Method to find company by Stripe customer ID (can be useful for webhooks)
    public Company getCompanyByStripeCustomerId(String stripeCustomerId) {
        return companyRepository.findByStripeCustomerId(stripeCustomerId);
    }
}
