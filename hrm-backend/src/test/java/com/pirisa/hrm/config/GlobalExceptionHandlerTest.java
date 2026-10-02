package com.pirisa.hrm.config;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void unsupportedMethodReturns405InsteadOfInternalServerError() {
        HttpRequestMethodNotSupportedException exception =
                new HttpRequestMethodNotSupportedException("GET");

        assertThat(handler.handleMethodNotSupported(exception).getStatusCode())
                .isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
    }

    @Test
    void malformedJsonReturnsBadRequest() {
        HttpMessageNotReadableException exception =
                new HttpMessageNotReadableException("invalid json");

        assertThat(handler.handleUnreadableRequest(exception).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void databaseConstraintConflictReturns409() {
        DataIntegrityViolationException exception =
                new DataIntegrityViolationException("duplicate key");

        assertThat(handler.handleDataConflict(exception).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }
}
