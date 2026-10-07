package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.*;
import com.pirisa.hrm.dto.common.ApiResponse;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.MissingPunchRequest;
import com.pirisa.hrm.model.Payrole;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.service.EmployeeSelfServiceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/self-service")
public class EmployeeSelfServiceController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeSelfServiceController.class);

    @Autowired
    private EmployeeSelfServiceService selfService;

    @Autowired
    private EmployeeRepository employeeRepository;

    /**
     * Dashboard data for the logged-in employee
     * GET /api/self-service/dashboard/{employeeId}
     */
    @GetMapping("/dashboard/{employeeId}")
    public ResponseEntity<ApiResponse<SelfServiceDashboardDTO>> getDashboard(@PathVariable Long employeeId) {
        try {
            SelfServiceDashboardDTO dashboard = selfService.getDashboard(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Dashboard loaded", dashboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Get own profile
     * GET /api/self-service/profile/{employeeId}
     */
    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<ApiResponse<EmployeeSelfProfileDTO>> getProfile(@PathVariable Long employeeId) {
        try {
            EmployeeSelfProfileDTO profile = selfService.getSelfProfile(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Profile loaded", profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Update own profile
     * PUT /api/self-service/profile/{employeeId}
     */
    @PutMapping("/profile/{employeeId}")
    public ResponseEntity<ApiResponse<EmployeeSelfProfileDTO>> updateProfile(
            @PathVariable Long employeeId,
            @Valid @RequestBody ProfileUpdateRequestDTO request) {
        try {
            EmployeeSelfProfileDTO updated = selfService.updateSelfProfile(employeeId, request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Get leave balance summary
     * GET /api/self-service/leave-balance/{employeeId}
     */
    @GetMapping("/leave-balance/{employeeId}")
    public ResponseEntity<ApiResponse<LeaveBalanceSummaryDTO>> getLeaveBalance(@PathVariable Long employeeId) {
        try {
            LeaveBalanceSummaryDTO balance = selfService.getLeaveBalance(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Leave balance loaded", balance));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Submit missing punch request
     * POST /api/self-service/missing-punch/{employeeId}
     */
    @PostMapping("/missing-punch/{employeeId}")
    public ResponseEntity<ApiResponse<MissingPunchRequest>> submitMissingPunch(
            @PathVariable Long employeeId,
            @Valid @RequestBody MissingPunchRequestDTO request,
            Authentication authentication) {
        if (!isOwnEmployee(employeeId, authentication)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, "You can only submit requests for your own attendance."));
        }
        try {
            MissingPunchRequest saved = selfService.submitMissingPunchRequest(employeeId, request);
            return ResponseEntity.ok(ApiResponse.success("Missing punch request submitted successfully", saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Get my missing punch requests
     * GET /api/self-service/missing-punch/{employeeId}
     */
    @GetMapping("/missing-punch/{employeeId}")
    public ResponseEntity<ApiResponse<List<MissingPunchRequest>>> getMyMissingPunchRequests(
            @PathVariable Long employeeId,
            Authentication authentication) {
        if (!isOwnEmployee(employeeId, authentication)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, "You can only access your own attendance requests."));
        }
        List<MissingPunchRequest> requests = selfService.getMyMissingPunchRequests(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Requests loaded", requests));
    }

    /**
     * Cancel a pending missing punch request
     * DELETE /api/self-service/missing-punch/{employeeId}/{requestId}
     */
    @DeleteMapping("/missing-punch/{employeeId}/{requestId}")
    public ResponseEntity<ApiResponse<Void>> cancelMissingPunch(
            @PathVariable Long employeeId,
            @PathVariable Long requestId,
            Authentication authentication) {
        if (!isOwnEmployee(employeeId, authentication)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, "You can only cancel your own attendance requests."));
        }
        try {
            selfService.cancelMissingPunchRequest(employeeId, requestId);
            return ResponseEntity.ok(ApiResponse.success("Request cancelled", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Get my payslips
     * GET /api/self-service/payslips/{employeeId}
     */
    @GetMapping("/payslips/{employeeId}")
    public ResponseEntity<ApiResponse<List<Payrole>>> getMyPayslips(@PathVariable Long employeeId) {
        List<Payrole> payslips = selfService.getMyPayslips(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Payslips loaded", payslips));
    }

    /**
     * Get my attendance history
     * GET /api/self-service/attendance/{employeeId}?month=1&year=2026
     */
    @GetMapping("/attendance/{employeeId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getMyAttendanceHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication authentication) {
        if (!isOwnEmployee(employeeId, authentication)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error(403, "You can only access your own attendance history."));
        }
        List<Attendance> history = selfService.getMyAttendanceHistory(employeeId, month, year);
        return ResponseEntity.ok(ApiResponse.success("Attendance history loaded", history));
    }

    private boolean isOwnEmployee(Long employeeId, Authentication authentication) {
        if (employeeId == null || authentication == null || authentication.getName() == null) {
            return false;
        }
        Employee authenticatedEmployee = employeeRepository.findByUsername(authentication.getName());
        return authenticatedEmployee != null && authenticatedEmployee.getId() == employeeId;
    }
}