package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.RecruitmentStatsDTO;
import com.pirisa.hrm.repository.ApplicantRepository;
import com.pirisa.hrm.repository.InterviewRepository;
import com.pirisa.hrm.repository.JobPostingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RecruitmentStatsService {

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Transactional(readOnly = true)
    public RecruitmentStatsDTO getStats(Long companyId) {
        RecruitmentStatsDTO stats = new RecruitmentStatsDTO();

        stats.setTotalJobs(jobPostingRepository.findByCompanyIdOrderByPostedDateDesc(companyId).size());
        stats.setOpenJobs(jobPostingRepository.countByCompanyIdAndStatus(companyId, "OPEN"));
        stats.setClosedJobs(jobPostingRepository.countByCompanyIdAndStatus(companyId, "CLOSED"));

        stats.setTotalApplicants(applicantRepository.countByCompanyId(companyId));
        stats.setNewApplicants(applicantRepository.countByCompanyIdAndStatus(companyId, "NEW"));
        stats.setScreeningApplicants(applicantRepository.countByCompanyIdAndStatus(companyId, "SCREENING"));
        stats.setInterviewApplicants(applicantRepository.countByCompanyIdAndStatus(companyId, "INTERVIEW"));
        stats.setOfferApplicants(applicantRepository.countByCompanyIdAndStatus(companyId, "OFFER"));
        stats.setHiredApplicants(applicantRepository.countByCompanyIdAndStatus(companyId, "HIRED"));
        stats.setRejectedApplicants(applicantRepository.countByCompanyIdAndStatus(companyId, "REJECTED"));

        stats.setUpcomingInterviews(interviewRepository
                .findUpcomingInterviews(companyId, LocalDateTime.now()).size());
        stats.setTodayInterviews(interviewRepository.findTodayInterviews(companyId).size());

        return stats;
    }
}