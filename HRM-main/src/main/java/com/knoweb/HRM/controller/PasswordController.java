package com.knoweb.HRM.controller;

import com.knoweb.HRM.service.EmailService;
import com.knoweb.HRM.service.PasswordResetService;
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
    private final EmailService         emailService;

    public PasswordController(PasswordResetService resetService,
                              EmailService emailService) {
        this.resetService = resetService;
        this.emailService  = emailService;
    }

    /**
     * Generates and emails a new random password to the account matching the given identifier.
     *
     * @param identifier email or username of the account
     * @return JSON indicating success or failure
     * @since 9+
     */
    @PostMapping(value = "/forgotPassword", produces = "application/json")
    public ResponseEntity<?> forgotPassword(@RequestParam("identifier") String identifier) {
        try {
            String newPassword = resetService.resetPasswordFor(identifier);

            // build and send email
            String subject = "Password Reset Request";
            String content = "<p>Your password has been reset successfully.</p>"
                    + "<p>Your new password is: <strong>" + newPassword + "</strong></p>"
                    + "<p>Please log in and change it as soon as possible.</p>";
            emailService.sendEmail(resetService.getEmailFor(identifier), subject, content);

            Map<String,Object> result = new HashMap<>();
            result.put("resultCode", 100);
            result.put("resultDesc", "Password reset successfully. Check your email.");
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (PasswordResetService.NotFoundException ex) {
            Map<String,Object> error = new HashMap<>();
            error.put("resultCode", 101);
            error.put("resultDesc", ex.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);

        } catch (Exception ex) {
            Map<String,Object> error = new HashMap<>();
            error.put("resultCode", 102);
            error.put("resultDesc", "An error occurred while processing your request.");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
