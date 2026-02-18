package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Email;
import com.knoweb.HRM.repository.EmailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Date;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailRepository emailRepository;

    public void sendEmail(String to, String subject, String content) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true indicates HTML content

            // Send the email
            mailSender.send(message);

            // Store the email in the database
            Email email = new Email();
            email.setRecipient(to);
            email.setSubject(subject);
            email.setContent(content);
            email.setSentAt(new Date());
            email.setSuccess(true);
            emailRepository.save(email);

        } catch (MessagingException e) {
            // Handle email sending failure and log the error
            Email email = new Email();
            email.setRecipient(to);
            email.setSubject(subject);
            email.setContent(content);
            email.setSentAt(new Date());
            email.setSuccess(false);
            emailRepository.save(email);
        }
    }
}
