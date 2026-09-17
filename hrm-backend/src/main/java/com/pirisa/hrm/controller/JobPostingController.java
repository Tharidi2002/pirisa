package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.JobPostingDTO;
import com.pirisa.hrm.dto.JobPostingRequest;
import com.pirisa.hrm.dto.common.ApiResponse;
import com.pirisa.hrm.service.JobPostingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/recruitment/jobs")
public class JobPostingController {

    @Autowired
    private JobPostingService jobPostingService;

    @PostMapping
    public ResponseEntity<ApiResponse<JobPostingDTO>> createJob(
            @RequestParam Long companyId,
            @Valid @RequestBody JobPostingRequest request) {
        try {
            JobPostingDTO job = jobPostingService.createJob(companyId, request);
            return ResponseEntity.ok(ApiResponse.success("Job posted successfully", job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<List<JobPostingDTO>>> getJobsByCompany(@PathVariable Long companyId) {
        List<JobPostingDTO> jobs = jobPostingService.getJobsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success("Jobs loaded", jobs));
    }

    @GetMapping("/company/{companyId}/open")
    public ResponseEntity<ApiResponse<List<JobPostingDTO>>> getOpenJobs(@PathVariable Long companyId) {
        List<JobPostingDTO> jobs = jobPostingService.getOpenJobs(companyId);
        return ResponseEntity.ok(ApiResponse.success("Open jobs loaded", jobs));
    }

    @GetMapping("/company/{companyId}/search")
    public ResponseEntity<ApiResponse<List<JobPostingDTO>>> searchJobs(
            @PathVariable Long companyId,
            @RequestParam String query) {
        List<JobPostingDTO> jobs = jobPostingService.searchJobs(companyId, query);
        return ResponseEntity.ok(ApiResponse.success("Jobs found", jobs));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobPostingDTO>> getJobById(@PathVariable Long jobId) {
        try {
            JobPostingDTO job = jobPostingService.getJobById(jobId);
            return ResponseEntity.ok(ApiResponse.success("Job loaded", job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobPostingDTO>> updateJob(
            @PathVariable Long jobId,
            @Valid @RequestBody JobPostingRequest request) {
        try {
            JobPostingDTO job = jobPostingService.updateJob(jobId, request);
            return ResponseEntity.ok(ApiResponse.success("Job updated successfully", job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PutMapping("/{jobId}/status")
    public ResponseEntity<ApiResponse<JobPostingDTO>> updateJobStatus(
            @PathVariable Long jobId,
            @RequestParam String status) {
        try {
            JobPostingDTO job = jobPostingService.updateJobStatus(jobId, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated", job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long jobId) {
        try {
            jobPostingService.deleteJob(jobId);
            return ResponseEntity.ok(ApiResponse.success("Job deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }
}