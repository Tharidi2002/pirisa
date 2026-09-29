package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.DemoRequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withUnauthorizedRequest;
import static org.springframework.http.HttpMethod.POST;

class DemoRequestSheetServiceTest {

    private static final String WEB_APP_URL =
            "https://script.google.com/macros/s/test-deployment/exec";
    private static final String SHARED_SECRET =
            "0123456789abcdef0123456789abcdef";

    @Test
    void appendPostsDemoRequestAndRequiresAppsScriptSuccess() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        DemoRequestSheetService service = new DemoRequestSheetService(
                restTemplate, WEB_APP_URL, SHARED_SECRET);
        server.expect(requestTo(WEB_APP_URL))
                .andExpect(method(POST))
                .andExpect(jsonPath("$.token").value(SHARED_SECRET))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andRespond(withSuccess("{\"success\":true,\"rowNumber\":2}", MediaType.APPLICATION_JSON));

        service.append(testRequest());

        server.verify();
        assertThat(service.isConfigured()).isTrue();
    }

    @Test
    void appendFollowsGoogleContentServiceRedirectBeforeCheckingSuccess() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        DemoRequestSheetService service = new DemoRequestSheetService(
                restTemplate, WEB_APP_URL, SHARED_SECRET);
        URI contentUrl = URI.create("https://script.googleusercontent.com/macros/echo?key=test");

        server.expect(requestTo(WEB_APP_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.FOUND).location(contentUrl));
        server.expect(requestTo(contentUrl))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess("{\"success\":true,\"rowNumber\":4}", MediaType.APPLICATION_JSON));

        service.append(testRequest());

        server.verify();
    }

    @Test
    void appendFailsWhenAppsScriptDoesNotConfirmTheWrite() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
        DemoRequestSheetService service = new DemoRequestSheetService(
                restTemplate, WEB_APP_URL, SHARED_SECRET);
        server.expect(requestTo(WEB_APP_URL))
                .andRespond(withSuccess("{\"success\":false}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> service.append(testRequest()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("did not confirm");
        server.verify();
    }

    @Test
    void isConfiguredRejectsNonGoogleScriptUrlsAndShortSecrets() {
        DemoRequestSheetService wrongHost = new DemoRequestSheetService(
                new RestTemplate(), "https://example.com/macros/s/test/exec", SHARED_SECRET);
        DemoRequestSheetService shortSecret = new DemoRequestSheetService(
                new RestTemplate(), WEB_APP_URL, "too-short");

        assertThat(wrongHost.isConfigured()).isFalse();
        assertThat(shortSecret.isConfigured()).isFalse();
    }

    private DemoRequestDTO testRequest() {
        return new DemoRequestDTO(
                "Test User", "test@example.com", "+94 77 123 4567",
                "Test Company", "11-50 employees", "Payroll demo");
    }
}