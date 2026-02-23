package com.knoweb.HRM.controller;

import com.knoweb.HRM.dto.CompanyRegistrationRequest;
import com.knoweb.HRM.service.CompanyRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
@CrossOrigin(origins = "http://localhost:5174")
public class CompanyRegistrationController {

    @Autowired
    private CompanyRegistrationService companyRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<?> registerCompany(@RequestBody CompanyRegistrationRequest request) {
        try {
            String result = companyRegistrationService.registerCompany(request);
            if (result.equals("SUCCESS")) {
                return ResponseEntity.ok().body("{\"message\": \"Company registered successfully\", \"status\": \"success\"}");
            } else {
                return ResponseEntity.badRequest().body("{\"message\": \"" + result + "\", \"status\": \"error\"}");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"Registration failed: " + e.getMessage() + "\", \"status\": \"error\"}");
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameAvailability(@PathVariable String username) {
        try {
            boolean available = companyRegistrationService.isUsernameAvailable(username);
            return ResponseEntity.ok().body("{\"available\": " + available + "}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"Error checking username: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailAvailability(@PathVariable String email) {
        try {
            boolean available = companyRegistrationService.isEmailAvailable(email);
            return ResponseEntity.ok().body("{\"available\": " + available + "}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"Error checking email: " + e.getMessage() + "\"}");
        }
    }
}