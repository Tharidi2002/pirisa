package com.pirisa.hrm.controller;

import com.pirisa.hrm.service.DemoRequestSheetService;
import com.pirisa.hrm.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailControllerTest {
    @Mock
    private EmailService emailService;

    @Mock
    private DemoRequestSheetService demoRequestSheetService;

    @InjectMocks
    private EmailController emailController;

    @Test
    void returnsSuccessOnlyWhenEmailServiceReportsDelivery() {
        when(emailService.sendEmail("person@example.com", "Test", "Body")).thenReturn(true);

        var response = emailController.sendEmail("person@example.com", "Test", "Body");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("success", true);
    }

    @Test
    void returnsGatewayErrorInsteadOfFalseSuccessWhenEmailCannotBeSent() {
        when(emailService.sendEmail("person@example.com", "Test", "Body")).thenReturn(false);

        var response = emailController.sendEmail("person@example.com", "Test", "Body");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).containsEntry("success", false);
    }
}
