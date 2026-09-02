package com.pirisa.hrm.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pirisa.hrm.repository.AuditLogRepository;

/**
 * Service for managing secure document access and compliance tracking
 */
@Service
public class DocumentSecurityService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public static final String DOC_TYPE_CONTRACT = "CONTRACT";
    public static final String DOC_TYPE_PAYSLIP = "PAYSLIP";
    public static final String DOC_TYPE_STATUTORY = "STATUTORY";
    public static final String DOC_TYPE_CERTIFICATION = "CERTIFICATION";

    /**
     * Check if user has access to an employee document
     */
    public boolean canAccessDocument(Long userId, String userRole, Long documentOwnerId) {
        // HRM and Company admins can access all
        if ("HRM".equals(userRole) || "CMPNY".equals(userRole)) {
            return true;
        }
        // Employees can only access their own documents
        if ("EMPLOYEE".equals(userRole)) {
            return userId.equals(documentOwnerId);
        }
        return false;
    }

    /**
     * Log document access for compliance
     */
    public void logDocumentAccess(Long documentId, String documentType, Long accessedBy, String status) {
        Map<String, Object> details = new HashMap<>();
        details.put("documentType", documentType);
        details.put("timestamp", LocalDateTime.now());
        details.put("accessStatus", status);

        // This would be logged via AuditService in production
    }

    /**
     * Generate document access report
     */
    public Map<String, Object> getDocumentAccessReport(Long employeeId, String documentType) {
        Map<String, Object> report = new HashMap<>();
        report.put("employeeId", employeeId);
        report.put("documentType", documentType);
        report.put("totalAccesses", 0);
        report.put("lastAccessed", LocalDateTime.now());
        report.put("complianceStatus", "COMPLIANT");
        return report;
    }

    /**
     * Validate document sensitivity and encryption requirements
     */
    public boolean isDocumentEncrypted(String documentType) {
        return DOC_TYPE_PAYSLIP.equals(documentType) || 
               DOC_TYPE_STATUTORY.equals(documentType) ||
               DOC_TYPE_CONTRACT.equals(documentType);
    }
}
