package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.RecruitmentStatsDTO;
import com.pirisa.hrm.dto.common.ApiResponse;
import com.pirisa.hrm.service.RecruitmentStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruitment/stats")
public class RecruitmentStatsController {

    @Autowired
    private RecruitmentStatsService statsService;

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<RecruitmentStatsDTO>> getStats(@PathVariable Long companyId) {
        RecruitmentStatsDTO stats = statsService.getStats(companyId);
        return ResponseEntity.ok(ApiResponse.success("Stats loaded", stats));
    }
}