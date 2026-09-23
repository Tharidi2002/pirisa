package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.DemoRequestDTO;
import com.pirisa.hrm.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Value("${spring.mail.username:knowebtest@gmail.com}")
    private String adminEmail;

    @PostMapping("/send")
    public String sendEmail(@RequestParam String to, @RequestParam String subject, @RequestParam String content) {
        emailService.sendEmail(to, subject, content);
        return "Email sent!";
    }

    @PostMapping("/request-demo")
    public ResponseEntity<?> requestDemo(@RequestBody DemoRequestDTO request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getFullName() == null || request.getFullName().trim().isEmpty() ||
                request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Name, email, and phone number are required.");
                return ResponseEntity.badRequest().body(error);
            }

            // 1. Build notification email for Admin / Sales team
            String adminSubject = "🚀 New Demo Request: " + request.getFullName() + 
                    (request.getCompanyName() != null && !request.getCompanyName().isEmpty() ? " (" + request.getCompanyName() + ")" : "");
            
            StringBuilder adminHtml = new StringBuilder();
            adminHtml.append("<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 24px;'>")
                     .append("<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;'>")
                     .append("<div style='background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; padding: 24px; text-align: center;'>")
                     .append("<h2 style='margin: 0; font-size: 22px; font-weight: bold;'>🎉 New Free Demo Request</h2>")
                     .append("<p style='margin: 6px 0 0; opacity: 0.9; font-size: 14px;'>A prospective client has requested a PirisaHR product demonstration.</p>")
                     .append("</div>")
                     .append("<div style='padding: 24px;'>")
                     .append("<table style='width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;'>")
                     .append("<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 10px 0; font-weight: bold; width: 35%;'>👤 Full Name:</td><td style='padding: 10px 0;'>").append(escapeHtml(request.getFullName())).append("</td></tr>")
                     .append("<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 10px 0; font-weight: bold;'>📧 Work Email:</td><td style='padding: 10px 0;'><a href='mailto:").append(escapeHtml(request.getEmail())).append("' style='color: #2563eb;'>").append(escapeHtml(request.getEmail())).append("</a></td></tr>")
                     .append("<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 10px 0; font-weight: bold;'>📞 Phone Number:</td><td style='padding: 10px 0;'><a href='tel:").append(escapeHtml(request.getPhone())).append("' style='color: #2563eb; font-weight: bold;'>").append(escapeHtml(request.getPhone())).append("</a></td></tr>")
                     .append("<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 10px 0; font-weight: bold;'>🏢 Company:</td><td style='padding: 10px 0;'>").append(request.getCompanyName() != null && !request.getCompanyName().isEmpty() ? escapeHtml(request.getCompanyName()) : "Not specified").append("</td></tr>")
                     .append("<tr style='border-bottom: 1px solid #f1f5f9;'><td style='padding: 10px 0; font-weight: bold;'>👥 Team Size:</td><td style='padding: 10px 0;'>").append(request.getTeamSize() != null && !request.getTeamSize().isEmpty() ? escapeHtml(request.getTeamSize()) : "Not specified").append("</td></tr>")
                     .append("<tr><td style='padding: 10px 0; font-weight: bold; vertical-align: top;'>💬 Requirements:</td><td style='padding: 10px 0;'>").append(request.getMessage() != null && !request.getMessage().isEmpty() ? escapeHtml(request.getMessage()) : "None provided").append("</td></tr>")
                     .append("</table>")
                     .append("<div style='margin-top: 24px; padding: 14px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; font-size: 13px; color: #1e40af;'>")
                     .append("⚡ <strong>Next Step:</strong> Contact the prospect via phone or email to schedule an interactive walkthrough.")
                     .append("</div>")
                     .append("</div>")
                     .append("<div style='background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>")
                     .append("PirisaHR Management System &bull; Lead Notification")
                     .append("</div>")
                     .append("</div></body></html>");

            // Send notification to admin/sales
            emailService.sendEmail(adminEmail, adminSubject, adminHtml.toString());

            // 2. Build polite confirmation email to the user
            String clientSubject = "Thank you for requesting a PirisaHR Demo!";
            StringBuilder clientHtml = new StringBuilder();
            clientHtml.append("<!DOCTYPE html><html><body style='font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 24px;'>")
                      .append("<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;'>")
                      .append("<div style='background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; padding: 24px; text-align: center;'>")
                      .append("<h2 style='margin: 0; font-size: 22px; font-weight: bold;'>PirisaHR Product Demo</h2>")
                      .append("<p style='margin: 6px 0 0; opacity: 0.9; font-size: 14px;'>Smart HR & Workforce Automation</p>")
                      .append("</div>")
                      .append("<div style='padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;'>")
                      .append("<p>Dear <strong>").append(escapeHtml(request.getFullName())).append("</strong>,</p>")
                      .append("<p>Thank you for your interest in <strong>PirisaHR</strong>! We received your demo request with phone number: <strong>").append(escapeHtml(request.getPhone())).append("</strong>.</p>")
                      .append("<p>One of our HR solution specialists will reach out to you within 24 hours to schedule a personalized live demonstration tailored to your organization's workflow.</p>")
                      .append("<div style='background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0;'>")
                      .append("<h4 style='margin: 0 0 8px; color: #1e293b;'>What we'll explore in the demo:</h4>")
                      .append("<ul style='margin: 0; padding-left: 20px; color: #475569;'>")
                      .append("<li>Automated attendance & real-time clock-in tracking</li>")
                      .append("<li>Single-click EPF/ETF compliant monthly payroll runs</li>")
                      .append("<li>Employee self-service portal & leave request workflows</li>")
                      .append("<li>360-degree performance evaluation management</li>")
                      .append("</ul>")
                      .append("</div>")
                      .append("<p>If you have urgent questions, feel free to reply directly to this email.</p>")
                      .append("<p style='margin-top: 24px;'>Best regards,<br><strong>The PirisaHR Team</strong></p>")
                      .append("</div>")
                      .append("<div style='background: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>")
                      .append("&copy; PirisaHR System. All rights reserved.")
                      .append("</div>")
                      .append("</div></body></html>");

            // Send confirmation to requester
            emailService.sendEmail(request.getEmail(), clientSubject, clientHtml.toString());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demo request received successfully! We will contact you soon.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to process demo request: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}

