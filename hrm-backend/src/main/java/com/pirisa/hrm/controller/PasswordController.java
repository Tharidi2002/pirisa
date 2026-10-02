package com.pirisa.hrm.controller;

import com.pirisa.hrm.service.PasswordResetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/password")
public class PasswordController {

    private final PasswordResetService resetService;

    public PasswordController(PasswordResetService resetService) {
        this.resetService = resetService;
    }

    /**
     * Generates and emails a new random password to the account matching the given identifier.
     *
     * @param identifier email or username of the account
     * @return JSON indicating success or failure
     * @since 9+
     */
    @PostMapping(value = "/forgotPassword", produces = "application/json")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        try {
            resetService.resetPasswordForEmail(email);

            Map<String,Object> result = new HashMap<>();
            result.put("resultCode", 100);
            result.put("resultDesc", "Password reset successfully. Please check your email.");
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (PasswordResetService.NotFoundException ex) {
            Map<String,Object> error = new HashMap<>();
            error.put("resultCode", 101);
            error.put("resultDesc", "Email not found. Please check your email and try again.");
            error.put("message", "No account found with email: " + email);
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);

        } catch (PasswordResetService.DeliveryException ex) {
            Map<String,Object> error = new HashMap<>();
            error.put("resultCode", 102);
            error.put("resultDesc", ex.getMessage());
            return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);

        } catch (Exception ex) {
            Map<String,Object> error = new HashMap<>();
            error.put("resultCode", 102);
            error.put("resultDesc", "An error occurred while processing your request.");
            error.put("message", "Password reset failed. Please try again later.");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
