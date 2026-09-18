package com.pirisa.hrm.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pirisa.hrm.config.SecurityConfig;
import com.pirisa.hrm.dto.CompanyDetailsDTO;
import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.service.CompanyService;
import com.pirisa.hrm.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/company")
public class CompanyController {

    private static final Logger logger = LoggerFactory.getLogger(CompanyController.class);

    @Autowired
    private CompanyService companyService;

    @Autowired
    private SecurityConfig bCryptPasswordEncoder;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmailService emailService;


    @GetMapping(value = "/all", produces = {"application/json"})
    public ResponseEntity<?> getAllCompany() {
        try {
            List<Company> companies = companyService.getAllCompanies();

            List<Map<String, Object>> safeList = companies.stream()
                    .map(this::toCompanyMap)
                    .collect(java.util.stream.Collectors.toList());

            Map<String, Object> companyResponse = new HashMap<>();
            companyResponse.put("resultCode", 100);
            companyResponse.put("resultDesc", "Successfull");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("CompanyList", safeList);
            responseBody.put("response", companyResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @PostMapping(value = "/add_company", produces = {"application/json"})
    public ResponseEntity<?> addCompany(@RequestBody Company company) {
        try {
            String hashedPassword = bCryptPasswordEncoder.passwordEncoder().encode(company.getCmp_password());
            company.setCmp_password(hashedPassword);

            Company createdCompany = companyService.createCompany(company);
            if (createdCompany != null) {
                Map<String, Object> companyResponse = new HashMap<>();
                companyResponse.put("resultCode", 100);
                companyResponse.put("resultDesc", "Successfully Saved");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Company", toCompanyMap(createdCompany));
                responseBody.put("response", companyResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @PutMapping(value = "/{cmp_id}", produces = {"application/json"})
    public ResponseEntity<?> updateCompany(@PathVariable Long cmp_id, @RequestBody Company updateCompany) {
        try {
            logger.info("=== Company Update Request ===");
            logger.info("Company ID: {}", cmp_id);
            logger.info("Incoming cmp_name: {}", updateCompany.getCmp_name());
            logger.info("Incoming cmpEmail: {}", updateCompany.getCmpEmail());
            logger.info("Incoming username: {}", updateCompany.getUsername());

            Company company = companyService.updateCompany(cmp_id, updateCompany);
            if (company != null) {
                Map<String, Object> companyResponse = new HashMap<>();
                companyResponse.put("resultCode", 100);
                companyResponse.put("resultDesc", "Successfully Updated");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Company", toCompanyMap(company));  // ✅ Safe DTO
                responseBody.put("response", companyResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Company not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            logger.error("=== RUNTIME EXCEPTION in updateCompany ===", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 101);
            errorResponse.put("resultDesc", e.getMessage() != null ? e.getMessage() : "Update failed");
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("=== EXCEPTION in updateCompany ===", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error updating company: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @GetMapping(value = "/companyDetails/{cmp_id}", produces = "application/json")
    public ResponseEntity<?> getCompanyDetailsByCompanyId(@PathVariable long cmp_id) {
        try {
            List<CompanyDetailsDTO> company = companyService.getCompanyDetailsByCompanyId(cmp_id);
            if (company == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No Company Details found for this company ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("CompanyDetails", company);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching Company Details"));
        }
    }


    @PutMapping(value = "/changePassword/{cmp_id}", produces = {"application/json"})
    public ResponseEntity<?> changeCompanyPassword(@PathVariable Long cmp_id,
                                                   @RequestBody Map<String, String> passwordChangeRequest) {
        String oldPassword = passwordChangeRequest.get("oldPassword");
        String newPassword = passwordChangeRequest.get("newPassword");

        if (oldPassword == null || oldPassword.trim().isEmpty() ||
                newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", "Both old and new passwords must be provided"));
        }

        try {
            Company updatedCompany = companyService.changeCompanyPassword(cmp_id, oldPassword, newPassword);
            if (updatedCompany == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Company not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Password successfully updated");
            response.put("Company", updatedCompany.getCmp_name());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while updating the password"));
        }
    }


    @PostMapping(value = "/forgetPassword", produces = "application/json")
    public ResponseEntity<?> forgotPassword(@RequestParam("cmpEmail") String cmpEmail) {
        try {
            String randomPassword = companyService.forgotPassword(cmpEmail);

            String subject = "Password Reset Request";
            String content = "<p>Your password has been reset successfully.</p>"
                    + "<p>Your new password is: <strong>" + randomPassword + "</strong></p>"
                    + "<p>Please log in and change your password as soon as possible.</p>";

            emailService.sendEmail(cmpEmail, subject, content);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Password reset successfully. The new password has been sent to your email.");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while processing your request"));
        }
    }

    @DeleteMapping(value = "/{cmp_id}", produces = {"application/json"})
    public ResponseEntity<?> deleteCompany(@PathVariable Long cmp_id) {
        try {
            companyService.deleteCompany(cmp_id);

            Map<String, Object> companyResponse = new HashMap<>();
            companyResponse.put("resultCode", 100);
            companyResponse.put("resultDesc", "Successfully Deleted");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", cmp_id);
            responseBody.put("response", companyResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
     * Convert Company entity to a safe Map (avoids lazy-loading exceptions)
     */
    private Map<String, Object> toCompanyMap(Company company) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", company.getId());
        map.put("cmp_name", company.getCmp_name());
        map.put("cmp_address", company.getCmp_address());
        map.put("cmp_phone", company.getCmp_phone());
        map.put("cmpEmail", company.getCmpEmail());
        map.put("username", company.getUsername());
        map.put("cmp_reg_no", company.getCmp_reg_no());
        map.put("vat_no", company.getVat_no());
        map.put("tin_no", company.getTin_no());
        map.put("role", company.getRole());
        map.put("package_name", company.getPackage_name());
        map.put("company_status", company.getCompany_status());
        map.put("joinedAt", company.getJoinedAt());
        map.put("stripeCustomerId", company.getStripeCustomerId());
        map.put("lastLeaveCalculationDate", company.getLastLeaveCalculationDate());
        // ⚠️ DO NOT include userList, eployeeList, unitList (they cause LazyInitializationException)
        return map;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        logger.error("=== EXCEPTION in CompanyController ===", e);
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("resultCode", 101);
        errorResponse.put("resultDesc", "ERROR: " + e.getMessage());

        String jsonResponse;
        try {
            jsonResponse = new ObjectMapper().writeValueAsString(errorResponse);
        } catch (Exception ex) {
            jsonResponse = "{\"resultCode\":101,\"resultDesc\":\"ERROR\"}";
        }
        return new ResponseEntity<>(jsonResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}