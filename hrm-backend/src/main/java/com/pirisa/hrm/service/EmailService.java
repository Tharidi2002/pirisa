package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Email;
import com.pirisa.hrm.model.CalendarEvent;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.EmailRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailRepository emailRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Value("${spring.mail.username:}")
    private String senderAddress;

    @Value("${spring.mail.password:}")
    private String senderPassword;

    public void sendHtmlEmailOrThrow(String to, String subject, String content, String replyTo) {
        if (senderAddress == null || senderAddress.trim().isEmpty()
                || senderPassword == null || senderPassword.trim().isEmpty()) {
            throw new IllegalStateException("SMTP sender credentials are not configured.");
        }

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            if (replyTo != null && !replyTo.trim().isEmpty()) {
                helper.setReplyTo(replyTo);
            }
        } catch (MessagingException e) {
            throw new IllegalStateException("Could not prepare the email message.", e);
        }

        mailSender.send(message);
    }

    public boolean sendEmail(String to, String subject, String content) {
        if (senderAddress == null || senderAddress.trim().isEmpty()
                || senderPassword == null || senderPassword.trim().isEmpty()) {
            logger.warn("Email delivery skipped because SMTP sender credentials are not configured.");
            saveEmailRecord(to, subject, content, false);
            return false;
        }

        boolean success;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(senderAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            success = true;
        } catch (MessagingException | MailException e) {
            logger.warn("Email delivery failed. Check SMTP configuration and provider logs.", e);
            success = false;
        }

        saveEmailRecord(to, subject, content, success);
        return success;
    }

    private void saveEmailRecord(String to, String subject, String content, boolean success) {
        Email email = new Email();
        email.setRecipient(to);
        email.setSubject(subject);
        email.setContent(content);
        email.setSentAt(new Date());
        email.setSuccess(success);
        emailRepository.save(email);
    }

    /**
     * Send calendar event notification to selected employees
     */
    public void sendCalendarEventNotification(CalendarEvent event, List<Long> employeeIds) {
        if (employeeIds == null || employeeIds.isEmpty()) {
            return;
        }

        // Get employee details
        List<Employee> employees = employeeIds.stream()
                .map(id -> employeeRepository.findById(id).orElse(null))
                .filter(emp -> emp != null && emp.getEmail() != null)
                .collect(Collectors.toList());

        for (Employee employee : employees) {
            try {
                String subject = "Calendar Event Invitation: " + event.getTitle();
                String content = buildEventNotificationEmail(event, employee);
                sendEmail(employee.getEmail(), subject, content);
            } catch (Exception e) {
                // Log error but continue with other employees
                System.err.println("Failed to send email to employee " + employee.getId() + ": " + e.getMessage());
            }
        }
    }

    /**
     * Build HTML content for calendar event notification email
     */
    private String buildEventNotificationEmail(CalendarEvent event, Employee employee) {
        StringBuilder content = new StringBuilder();
        content.append("<html><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        
        // Header
        content.append("<div style='background-color: #3B82F6; color: white; padding: 20px; text-align: center;'>");
        content.append("<h1 style='margin: 0;'>📅 Calendar Event Invitation</h1>");
        content.append("</div>");
        
        // Event Details
        content.append("<div style='padding: 20px; background-color: #f9f9f9;'>");
        content.append("<h2 style='color: #333; margin-top: 0;'>").append(event.getTitle()).append("</h2>");
        
        if (event.getDescription() != null && !event.getDescription().isEmpty()) {
            content.append("<p style='color: #666;'><strong>Description:</strong> ").append(event.getDescription()).append("</p>");
        }
        
        // Date and Time
        content.append("<div style='background-color: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 15px 0;'>");
        content.append("<p style='margin: 0; color: #333;'><strong>📅 Date:</strong> ").append(event.getStartDate().toLocalDate()).append("</p>");
        if (event.getHasTime() != null && event.getHasTime()) {
            content.append("<p style='margin: 5px 0; color: #333;'><strong>⏰ Time:</strong> ");
            content.append(event.getStartDate().toLocalTime());
            if (event.getEndDate() != null) {
                content.append(" - ").append(event.getEndDate().toLocalTime());
            }
            content.append("</p>");
        }
        
        if (event.getLocation() != null && !event.getLocation().isEmpty()) {
            content.append("<p style='margin: 5px 0; color: #333;'><strong>📍 Location:</strong> ").append(event.getLocation()).append("</p>");
        }
        content.append("</div>");
        
        // Personal message
        content.append("<div style='margin: 20px 0;'>");
        content.append("<p style='color: #666;'>Dear ").append(employee.getFirstName()).append(" ").append(employee.getLastName()).append(",</p>");
        content.append("<p style='color: #666;'>You have been invited to this calendar event. Please mark your calendar and attend accordingly.</p>");
        content.append("</div>");
        
        // Footer
        content.append("<div style='background-color: #f0f0f0; padding: 15px; text-align: center; color: #666; font-size: 12px;'>");
        content.append("<p style='margin: 0;'>This is an automated notification from the HRM Calendar System.</p>");
        content.append("<p style='margin: 5px 0 0 0;'>If you have any questions, please contact your HR department.</p>");
        content.append("</div>");
        
        content.append("</body></html>");
        return content.toString();
    }
}
