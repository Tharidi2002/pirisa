package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.CompanyRegistrationRequest;
import com.pirisa.hrm.service.CompanyRegistrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyRegistrationController {

    private static final Logger logger = LoggerFactory.getLogger(CompanyRegistrationController.class);

    @Autowired
    private CompanyRegistrationService companyRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<?> registerCompany(@Valid @RequestBody CompanyRegistrationRequest request) {
        try {
            companyRegistrationService.registerCompany(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Company registered successfully",
                    "status", "success"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage(), "status", "error"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Company details conflict with an existing account.", "status", "error"));
        } catch (Exception e) {
            logger.error("Company registration failed.", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Company registration failed. Please try again later.", "status", "error"));
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameAvailability(@PathVariable String username) {
        try {
            boolean available = companyRegistrationService.isUsernameAvailable(username);
            return ResponseEntity.ok().body("{\"available\": " + available + "}");
        } catch (Exception e) {
            logger.error("Could not check company username availability.", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Could not check username availability."));
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailAvailability(@PathVariable String email) {
        try {
            boolean available = companyRegistrationService.isEmailAvailable(email);
            return ResponseEntity.ok().body("{\"available\": " + available + "}");
        } catch (Exception e) {
            logger.error("Could not check company email availability.", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Could not check email availability."));
        }
    }
}
