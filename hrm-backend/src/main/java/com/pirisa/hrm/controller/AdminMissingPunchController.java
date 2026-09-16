package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.common.ApiResponse;
import com.pirisa.hrm.model.MissingPunchRequest;
import com.pirisa.hrm.service.AdminMissingPunchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/missing-punch")
public class AdminMissingPunchController {

    @Autowired
    private AdminMissingPunchService adminService;

    /**
     * Get pending missing punch requests for a company
     * GET /api/admin/missing-punch/pending/{companyId}
     */
    @GetMapping("/pending/{companyId}")
    public ResponseEntity<ApiResponse<List<MissingPunchRequest>>> getPendingRequests(
            @PathVariable Long companyId) {
        List<MissingPunchRequest> requests = adminService.getPendingRequestsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success("Pending requests loaded", requests));
    }

    /**
     * Get all missing punch requests for a company
     * GET /api/admin/missing-punch/all/{companyId}
     */
    @GetMapping("/all/{companyId}")
    public ResponseEntity<ApiResponse<List<MissingPunchRequest>>> getAllRequests(
            @PathVariable Long companyId) {
        List<MissingPunchRequest> requests = adminService.getAllRequestsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success("All requests loaded", requests));
    }

    /**
     * Approve a missing punch request
     * PUT /api/admin/missing-punch/{requestId}/approve
     */
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<MissingPunchRequest>> approveRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Long> body) {
        try {
            Long approverId = body.get("approverId");
            MissingPunchRequest request = adminService.approveRequest(requestId, approverId);
            return ResponseEntity.ok(ApiResponse.success("Request approved", request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    /**
     * Reject a missing punch request
     * PUT /api/admin/missing-punch/{requestId}/reject
     */
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse<MissingPunchRequest>> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body) {
        try {
            Long approverId = body.get("approverId") != null
                    ? Long.valueOf(body.get("approverId").toString()) : null;
            String reason = body.get("reason") != null
                    ? body.get("reason").toString() : "No reason provided";
            MissingPunchRequest request = adminService.rejectRequest(requestId, approverId, reason);
            return ResponseEntity.ok(ApiResponse.success("Request rejected", request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }
}