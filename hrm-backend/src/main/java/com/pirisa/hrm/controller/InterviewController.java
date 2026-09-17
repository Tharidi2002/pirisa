package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.InterviewDTO;
import com.pirisa.hrm.dto.InterviewFeedbackRequest;
import com.pirisa.hrm.dto.InterviewRequest;
import com.pirisa.hrm.dto.common.ApiResponse;
import com.pirisa.hrm.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/recruitment/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewDTO>> scheduleInterview(
            @Valid @RequestBody InterviewRequest request) {
        try {
            InterviewDTO interview = interviewService.scheduleInterview(request);
            return ResponseEntity.ok(ApiResponse.success("Interview scheduled", interview));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<ApiResponse<List<InterviewDTO>>> getInterviewsByApplicant(@PathVariable Long applicantId) {
        List<InterviewDTO> interviews = interviewService.getInterviewsByApplicant(applicantId);
        return ResponseEntity.ok(ApiResponse.success("Interviews loaded", interviews));
    }

    @GetMapping("/company/{companyId}/upcoming")
    public ResponseEntity<ApiResponse<List<InterviewDTO>>> getUpcomingInterviews(@PathVariable Long companyId) {
        List<InterviewDTO> interviews = interviewService.getUpcomingInterviews(companyId);
        return ResponseEntity.ok(ApiResponse.success("Upcoming interviews loaded", interviews));
    }

    @GetMapping("/company/{companyId}/today")
    public ResponseEntity<ApiResponse<List<InterviewDTO>>> getTodayInterviews(@PathVariable Long companyId) {
        List<InterviewDTO> interviews = interviewService.getTodayInterviews(companyId);
        return ResponseEntity.ok(ApiResponse.success("Today's interviews loaded", interviews));
    }

    @PutMapping("/{interviewId}/feedback")
    public ResponseEntity<ApiResponse<InterviewDTO>> updateFeedback(
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewFeedbackRequest request) {
        try {
            InterviewDTO interview = interviewService.updateFeedback(interviewId, request);
            return ResponseEntity.ok(ApiResponse.success("Feedback updated", interview));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @PutMapping("/{interviewId}/cancel")
    public ResponseEntity<ApiResponse<InterviewDTO>> cancelInterview(@PathVariable Long interviewId) {
        try {
            InterviewDTO interview = interviewService.cancelInterview(interviewId);
            return ResponseEntity.ok(ApiResponse.success("Interview cancelled", interview));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }

    @DeleteMapping("/{interviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteInterview(@PathVariable Long interviewId) {
        try {
            interviewService.deleteInterview(interviewId);
            return ResponseEntity.ok(ApiResponse.success("Interview deleted", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest(e.getMessage()));
        }
    }
}