package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentStatsDTO {
    private long totalJobs;
    private long openJobs;
    private long closedJobs;
    private long totalApplicants;
    private long newApplicants;
    private long screeningApplicants;
    private long interviewApplicants;
    private long offerApplicants;
    private long hiredApplicants;
    private long rejectedApplicants;
    private long upcomingInterviews;
    private long todayInterviews;
}