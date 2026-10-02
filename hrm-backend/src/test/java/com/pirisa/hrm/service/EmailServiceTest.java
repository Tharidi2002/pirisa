package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Email;
import com.pirisa.hrm.repository.EmailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import javax.mail.Session;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {
    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailRepository emailRepository;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void configureSender() {
        ReflectionTestUtils.setField(emailService, "senderAddress", "hrm@example.com");
        ReflectionTestUtils.setField(emailService, "senderPassword", "configured-password");
    }

    @Test
    void recordsAndReportsSuccessfulDelivery() throws Exception {
        when(mailSender.createMimeMessage())
                .thenReturn(new MimeMessage(Session.getInstance(new Properties())));

        boolean sent = emailService.sendEmail("employee@example.com", "Welcome", "<p>Hello</p>");

        assertThat(sent).isTrue();
        ArgumentCaptor<Email> emailCaptor = ArgumentCaptor.forClass(Email.class);
        verify(emailRepository).save(emailCaptor.capture());
        assertThat(emailCaptor.getValue().isSuccess()).isTrue();
        assertThat(emailCaptor.getValue().getRecipient()).isEqualTo("employee@example.com");
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void recordsAndReportsAuthenticationFailure() throws Exception {
        when(mailSender.createMimeMessage())
                .thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        doThrow(new MailAuthenticationException("authentication failed"))
                .when(mailSender).send(any(MimeMessage.class));

        boolean sent = emailService.sendEmail("employee@example.com", "Welcome", "<p>Hello</p>");

        assertThat(sent).isFalse();
        ArgumentCaptor<Email> emailCaptor = ArgumentCaptor.forClass(Email.class);
        verify(emailRepository).save(emailCaptor.capture());
        assertThat(emailCaptor.getValue().isSuccess()).isFalse();
    }

    @Test
    void missingSmtpCredentialsSkipNetworkSendAndRecordFailure() {
        ReflectionTestUtils.setField(emailService, "senderPassword", "");

        boolean sent = emailService.sendEmail("employee@example.com", "Welcome", "<p>Hello</p>");

        assertThat(sent).isFalse();
        verify(mailSender, never()).createMimeMessage();
        ArgumentCaptor<Email> emailCaptor = ArgumentCaptor.forClass(Email.class);
        verify(emailRepository).save(emailCaptor.capture());
        assertThat(emailCaptor.getValue().isSuccess()).isFalse();
    }
}
