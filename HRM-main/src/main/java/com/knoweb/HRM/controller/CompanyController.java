package com.knoweb.HRM.controller;

import com.knoweb.HRM.dto.CompanyDetailsDTO;
import com.knoweb.HRM.dto.PasswordChangeDTO;
import com.knoweb.HRM.dto.PasswordResetRequestDTO;
import com.knoweb.HRM.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/company")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    /**
     * Retrieves all companies. 
     * Note: In a multi-tenant system, this should be restricted.
     * For now, accessible by CMPNY role as per SecurityConfig.
     */
    @GetMapping(value = "/all", produces = {"application/json"})
    public ResponseEntity<List<CompanyDetailsDTO>> getAllCompanies() {
        List<CompanyDetailsDTO> companies = companyService.getAllCompaniesDetails();
        return ResponseEntity.ok(companies);
    }

    /**
     * Updates a company's details.
     * Uses companyId from the path and updated data from the request body.
     */
    @PutMapping(value = "/{companyId}", produces = {"application/json"})
    public ResponseEntity<CompanyDetailsDTO> updateCompany(@PathVariable Long companyId, @Valid @RequestBody CompanyDetailsDTO companyDetailsDTO) {
        CompanyDetailsDTO updatedCompany = companyService.updateCompany(companyId, companyDetailsDTO);
        return ResponseEntity.ok(updatedCompany);
    }

    /**
     * Gets detailed information for a single company by its ID.
     */
    @GetMapping(value = "/{companyId}", produces = "application/json")
    public ResponseEntity<CompanyDetailsDTO> getCompanyDetailsById(@PathVariable long companyId) {
        CompanyDetailsDTO company = companyService.getCompanyDetailsById(companyId);
        return ResponseEntity.ok(company);
    }

    /**
     * Changes the password for a company administrator.
     * The request body should contain oldPassword and newPassword.
     */
    @PutMapping(value = "/changePassword/{companyId}", produces = {"application/json"})
    public ResponseEntity<?> changeCompanyPassword(@PathVariable Long companyId, @Valid @RequestBody PasswordChangeDTO passwordChangeDTO) {
        companyService.changeCompanyPassword(companyId, passwordChangeDTO.getOldPassword(), passwordChangeDTO.getNewPassword());
        return ResponseEntity.ok().body("{\"message\": \"Password updated successfully\"}");
    }

    /**
     * Handles the 'Forgot Password' request.
     * Triggers an email with a new (random) password.
     */
    @PostMapping(value = "/forgotPassword", produces = "application/json")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequestDTO requestDTO) {
        companyService.forgotPassword(requestDTO.getEmail());
        return ResponseEntity.ok().body("{\"message\": \"Password reset successfully. A new password has been sent to your email.\"}");
    }
 
    // Removed the manual exception handler. 
    // GlobalExceptionHandler will handle specific exceptions like MethodArgumentNotValidException.
    // Other exceptions will be handled by Spring Boot's default handler, which is generally sufficient.
}
