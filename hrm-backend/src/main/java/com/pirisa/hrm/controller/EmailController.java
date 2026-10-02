package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.DemoRequestDTO;
import com.pirisa.hrm.service.EmailService;
import com.pirisa.hrm.service.DemoRequestSheetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/email")
public class EmailController {

    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private DemoRequestSheetService demoRequestSheetService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendEmail(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String content) {
        boolean sent = emailService.sendEmail(to, subject, content);
        Map<String, Object> response = new HashMap<>();
        response.put("success", sent);
        response.put("message", sent
                ? "Email sent successfully."
                : "Email could not be sent. Check SMTP configuration and server logs.");
        return ResponseEntity.status(sent ? HttpStatus.OK : HttpStatus.BAD_GATEWAY).body(response);
    }

    @PostMapping("/request-demo")
    public ResponseEntity<?> requestDemo(@Valid @RequestBody DemoRequestDTO request) {
        if (!demoRequestSheetService.isConfigured()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Demo request storage is not configured.");
            return ResponseEntity.status(503).body(error);
        }

        try {
            demoRequestSheetService.append(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Your demo request has been recorded. Our team will contact you soon.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to record demo request in Google Sheets.", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "We could not record your demo request right now. Please try again shortly.");
            return ResponseEntity.status(502).body(error);
        }
    }
}
