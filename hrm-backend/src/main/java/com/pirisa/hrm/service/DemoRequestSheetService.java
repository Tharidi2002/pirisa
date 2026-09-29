package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.DemoRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DemoRequestSheetService {

    private final RestTemplate restTemplate;
    private final String webAppUrl;
    private final String sharedSecret;

    @Autowired
    public DemoRequestSheetService(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${app.demo-request.sheets.web-app-url:}") String webAppUrl,
            @Value("${app.demo-request.sheets.shared-secret:}") String sharedSecret) {
        this(buildRestTemplate(restTemplateBuilder), webAppUrl, sharedSecret);
    }

    DemoRequestSheetService(RestTemplate restTemplate, String webAppUrl, String sharedSecret) {
        this.restTemplate = restTemplate;
        this.webAppUrl = webAppUrl == null ? "" : webAppUrl.trim();
        this.sharedSecret = sharedSecret == null ? "" : sharedSecret.trim();
    }

    public boolean isConfigured() {
        if (sharedSecret.length() < 32) {
            return false;
        }

        try {
            URI uri = URI.create(webAppUrl);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && "script.google.com".equalsIgnoreCase(uri.getHost())
                    && uri.getPath().startsWith("/macros/s/");
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public void append(DemoRequestDTO request) {
        if (!isConfigured()) {
            throw new IllegalStateException("Google Sheets integration is not configured.");
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("token", sharedSecret);
        payload.put("fullName", request.getFullName().trim());
        payload.put("email", request.getEmail().trim());
        payload.put("phone", request.getPhone().trim());
        payload.put("companyName", request.getCompanyName());
        payload.put("teamSize", request.getTeamSize());
        payload.put("message", request.getMessage());

        ResponseEntity<Map> response = restTemplate.postForEntity(webAppUrl, payload, Map.class);
        if (response.getStatusCode().is3xxRedirection()) {
            String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);
            if (location == null) {
                throw new IllegalStateException("Google Sheets redirect did not include a destination.");
            }

            URI redirectUri = URI.create(webAppUrl).resolve(location);
            if (!"https".equalsIgnoreCase(redirectUri.getScheme())
                    || !"script.googleusercontent.com".equalsIgnoreCase(redirectUri.getHost())) {
                throw new IllegalStateException("Google Sheets returned an unexpected redirect destination.");
            }
            response = restTemplate.getForEntity(redirectUri, Map.class);
        }

        Map<?, ?> responseBody = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful()
                || responseBody == null
                || !Boolean.TRUE.equals(responseBody.get("success"))) {
            Object responseMessage = responseBody == null ? null : responseBody.get("message");
            String detail = responseMessage instanceof String ? ((String) responseMessage).trim() : "";
            Object successValue = responseBody == null ? null : responseBody.get("success");
            String diagnostics = "HTTP " + response.getStatusCodeValue()
                + ", response body " + (responseBody == null ? "empty" : "keys=" + responseBody.keySet())
                + ", success field=" + (successValue == null ? "missing" : successValue.getClass().getSimpleName());
            throw new IllegalStateException(detail.isEmpty()
                ? "Google Sheets did not confirm the demo request (" + diagnostics + ")."
                : "Google Sheets did not confirm the demo request: " + detail + " (" + diagnostics + ").");
        }
    }

    private static RestTemplate buildRestTemplate(RestTemplateBuilder builder) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory() {
            @Override
            protected void prepareConnection(HttpURLConnection connection, String httpMethod) throws IOException {
                super.prepareConnection(connection, httpMethod);
                connection.setInstanceFollowRedirects(false);
            }
        };
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(20).toMillis());
        return builder.requestFactory(() -> requestFactory).build();
    }
}