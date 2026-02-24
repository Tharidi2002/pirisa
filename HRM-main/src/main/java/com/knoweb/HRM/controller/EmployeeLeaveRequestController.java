package com.knoweb.HRM.controller;

import com.knoweb.HRM.model.EmployeeLeave;
import com.knoweb.HRM.service.EmailService;
import com.knoweb.HRM.service.EmployeeLeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EmployeeLeaveRequestController {

    @Autowired
    private EmployeeLeaveService employeeLeaveService;

    @Autowired
    private EmailService emailService;

    // Create a new leave request
    @PostMapping("/leave-requests")
    public EmployeeLeave createLeaveRequest(@RequestBody EmployeeLeave leaveRequest) {
        return employeeLeaveService.saveLeaveRequest(leaveRequest);
    }

    // Get all leave requests
    @GetMapping("/leave-requests")
    public List<EmployeeLeave> getAllLeaveRequests() {
        return employeeLeaveService.getAllLeaveRequests();
    }

    // Get leave requests by employee ID
    @GetMapping("/leave-requests/employee/{employeeId}")
    public List<EmployeeLeave> getLeaveRequestsByEmployee(@PathVariable Long employeeId) {
        return employeeLeaveService.getLeaveRequestsByEmployeeId(employeeId);
    }

    // Update the status of a leave request
    @PutMapping("/leave-requests/{id}/status")
    public ResponseEntity<?> updateLeaveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate
    ) {
        String status = statusUpdate.get("status");
        String leaveReason = statusUpdate.get("leaveReason");

        try {
            EmployeeLeave updatedLeave = employeeLeaveService.updateLeaveStatus(id, status, leaveReason);

            // Send email notification upon status change
            String emailBody = "";
            if ("APPROVED".equalsIgnoreCase(status)) {
                emailBody = "Your leave request has been approved.";
            } else if ("REJECTED".equalsIgnoreCase(status)) {
                emailBody = "Your leave request has been rejected. Reason: " + leaveReason;
            }

            // Make sure the Employee object and its email are not null
            if (updatedLeave.getEmployee() != null && updatedLeave.getEmployee().getEmail() != null) {
                emailService.sendEmail(
                    updatedLeave.getEmployee().getEmail(),
                    "Leave Request Status Update",
                    emailBody
                );
            } else {
                // Log this issue or handle it gracefully
                System.out.println("Could not send email: Employee or email address is missing for leave ID " + updatedLeave.getId());
            }

            // Create a response map
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Leave status updated successfully.");
            response.put("leaveRequest", updatedLeave);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
