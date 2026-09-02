package com.pirisa.hrm.service;

import java.time.LocalDateTime;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pirisa.hrm.model.AuditLog;
import com.pirisa.hrm.repository.AuditLogRepository;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired(required = false)
    private HttpServletRequest httpServletRequest;

    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Log an action for audit trail
     */
    public void logAction(Long entityId, String entityType, String action, Long performedBy, Object oldValue, Object newValue) {
        try {
            AuditLog log = new AuditLog();
            log.setEntityId(entityId);
            log.setEntityType(entityType);
            log.setAction(action);
            log.setPerformedBy(performedBy);
            log.setTimestamp(LocalDateTime.now());

            if (oldValue != null) {
                log.setOldValue(objectMapper.writeValueAsString(oldValue));
            }
            if (newValue != null) {
                log.setNewValue(objectMapper.writeValueAsString(newValue));
            }

            if (httpServletRequest != null) {
                log.setIpAddress(getClientIp());
                log.setUserAgent(httpServletRequest.getHeader("User-Agent"));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to write audit log: " + e.getMessage());
        }
    }

    /**
     * Log with just a change description
     */
    public void logActionWithDescription(Long entityId, String entityType, String action, Long performedBy, String changeDetails) {
        try {
            AuditLog log = new AuditLog();
            log.setEntityId(entityId);
            log.setEntityType(entityType);
            log.setAction(action);
            log.setPerformedBy(performedBy);
            log.setChangeDetails(changeDetails);
            log.setTimestamp(LocalDateTime.now());

            if (httpServletRequest != null) {
                log.setIpAddress(getClientIp());
                log.setUserAgent(httpServletRequest.getHeader("User-Agent"));
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to write audit log: " + e.getMessage());
        }
    }

    private String getClientIp() {
        if (httpServletRequest == null) return "unknown";
        String xForwardedFor = httpServletRequest.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return httpServletRequest.getRemoteAddr();
    }
}
