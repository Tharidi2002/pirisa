package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.ApplicantDTO;
import com.pirisa.hrm.dto.ApplicantRequest;
import com.pirisa.hrm.dto.ApplicantStatusUpdateRequest;
import com.pirisa.hrm.dto.common.ApiResponse;
import com.pirisa.hrm.service.ApplicantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/recruitment/applicants")
public class ApplicantController {

    @Autowired
    private ApplicantService applicantService;

    /**
     * Public endpoint - no auth required (candidates apply here)
     * POST /api/recruitment/applicants/apply
     */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplicantDTO>> applyForJob(
            @Valid @RequestBody ApplicantRequest request) {
        try {
            ApplicantDTO applicant = applicantService.createApplicant(request);
            return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", applicant));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<List<ApplicantDTO>>> getApplicantsByCompany(@PathVariable Long companyId) {
        List<ApplicantDTO> applicants = applicantService.getApplicantsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success("Applicants loaded", applicants));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<ApplicantDTO>>> getApplicantsByJob(@PathVariable Long jobId) {
        List<ApplicantDTO> applicants = applicantService.getApplicantsByJob(jobId);
        return ResponseEntity.ok(ApiResponse.success("Applicants loaded", applicants));
    }

    @GetMapping("/company/{companyId}/status/{status}")
    public ResponseEntity<ApiResponse<List<ApplicantDTO>>> getApplicantsByStatus(
            @PathVariable Long companyId,
            @PathVariable String status) {
        List<ApplicantDTO> applicants = applicantService.getApplicantsByStatus(companyId, status);
        return ResponseEntity.ok(ApiResponse.success("Applicants loaded", applicants));
    }

    @GetMapping("/company/{companyId}/search")
    public ResponseEntity<ApiResponse<List<ApplicantDTO>>> searchApplicants(
            @PathVariable Long companyId,
            @RequestParam String query) {
        List<ApplicantDTO> applicants = applicantService.searchApplicants(companyId, query);
        return ResponseEntity.ok(ApiResponse.success("Applicants found", applicants));
    }

    @GetMapping("/{applicantId}")
    public ResponseEntity<ApiResponse<ApplicantDTO>> getApplicantById(@PathVariable Long applicantId) {
        try {
            ApplicantDTO applicant = applicantService.getApplicantById(applicantId);
            return ResponseEntity.ok(ApiResponse.success("Applicant loaded", applicant));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PutMapping("/{applicantId}/status")
    public ResponseEntity<ApiResponse<ApplicantDTO>> updateStatus(
            @PathVariable Long applicantId,
            @Valid @RequestBody ApplicantStatusUpdateRequest request) {
        try {
            ApplicantDTO applicant = applicantService.updateApplicantStatus(applicantId, request);
            return ResponseEntity.ok(ApiResponse.success("Status updated", applicant));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PutMapping("/{applicantId}")
    public ResponseEntity<ApiResponse<ApplicantDTO>> updateApplicant(
            @PathVariable Long applicantId,
            @Valid @RequestBody ApplicantRequest request) {
        try {
            ApplicantDTO applicant = applicantService.updateApplicant(applicantId, request);
            return ResponseEntity.ok(ApiResponse.success("Applicant updated", applicant));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @DeleteMapping("/{applicantId}")
    public ResponseEntity<ApiResponse<Void>> deleteApplicant(@PathVariable Long applicantId) {
        try {
            applicantService.deleteApplicant(applicantId);
            return ResponseEntity.ok(ApiResponse.success("Applicant deleted", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }
}