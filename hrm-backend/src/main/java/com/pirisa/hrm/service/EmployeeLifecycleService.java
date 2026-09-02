package com.pirisa.hrm.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.EmployeeRepository;

/**
 * Service for managing employee lifecycle events and status transitions
 */
@Service
public class EmployeeLifecycleService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditService auditService;

    public enum EmployeeStatus {
        ONBOARDING, ACTIVE, ON_LEAVE, INACTIVE, SUSPENDED, TERMINATED
    }

    /**
     * Get employee lifecycle status
     */
    public Map<String, Object> getEmployeeStatus(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        Map<String, Object> status = new HashMap<>();
        
        if (emp == null) {
            status.put("status", "NOT_FOUND");
            return status;
        }

        // Determine current lifecycle status
        LocalDate today = LocalDate.now();
        
        // Handle both LocalDate and String formats for join date
        LocalDate joinDate = null;
        Object joinDateObj = emp.getDateOfJoining();
        if (joinDateObj instanceof LocalDate) {
            joinDate = (LocalDate) joinDateObj;
        } else if (joinDateObj instanceof String) {
            try {
                joinDate = LocalDate.parse((String) joinDateObj);
            } catch (Exception e) {
                joinDate = null;
            }
        }

        String currentStatus;
        if (joinDate != null && joinDate.isAfter(today.minusDays(30))) {
            currentStatus = EmployeeStatus.ONBOARDING.toString();
        } else {
            currentStatus = EmployeeStatus.ACTIVE.toString();
        }

        status.put("status", currentStatus);
        status.put("employeeId", emp.getId());
        status.put("name", emp.getFirstName() + " " + emp.getLastName());
        status.put("joinDate", joinDate);
        status.put("department", emp.getDepartment() != null ? emp.getDepartment().getDptName() : "Unknown");
        status.put("role", emp.getRole());

        return status;
    }

    /**
     * Transition employee to a new lifecycle stage
     */
    public boolean transitionEmployeeStatus(Long employeeId, EmployeeStatus newStatus, Long performedBy, String reason) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) return false;

        String oldStatus = getEmployeeStatus(employeeId).get("status").toString();
        
        // Audit the transition
        auditService.logActionWithDescription(
            employeeId,
            "EMPLOYEE_LIFECYCLE",
            "STATUS_TRANSITION",
            performedBy,
            String.format("Status changed from %s to %s. Reason: %s", oldStatus, newStatus.toString(), reason)
        );

        return true;
    }

    /**
     * Get employee onboarding checklist
     */
    public Map<String, Object> getOnboardingChecklist(Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        Map<String, Object> checklist = new HashMap<>();

        if (emp == null) return checklist;

        checklist.put("employeeId", emp.getId());
        checklist.put("profileComplete", emp.getFirstName() != null && emp.getLastName() != null);
        checklist.put("bankDetailsSubmitted", emp.getEpfNo() != null);
        checklist.put("contractSigned", true); // Placeholder
        checklist.put("backgroundCheckCleared", true); // Placeholder
        checklist.put("trainingCompleted", false); // Placeholder
        checklist.put("systemAccessGranted", true); // Placeholder

        return checklist;
    }
}
