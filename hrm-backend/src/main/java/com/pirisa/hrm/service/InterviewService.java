package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.InterviewDTO;
import com.pirisa.hrm.dto.InterviewFeedbackRequest;
import com.pirisa.hrm.dto.InterviewRequest;
import com.pirisa.hrm.model.Applicant;
import com.pirisa.hrm.model.Interview;
import com.pirisa.hrm.model.JobPosting;
import com.pirisa.hrm.repository.ApplicantRepository;
import com.pirisa.hrm.repository.InterviewRepository;
import com.pirisa.hrm.repository.JobPostingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    /**
     * Schedule a new interview
     */
    @Transactional
    public InterviewDTO scheduleInterview(InterviewRequest request) {
        // Validate applicant exists
        Applicant applicant = applicantRepository.findById(request.getApplicantId())
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found"));

        // Validate interview date is in the future
        if (request.getInterviewDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Interview date must be in the future");
        }

        Interview interview = new Interview();
        interview.setApplicantId(request.getApplicantId());
        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewType(request.getInterviewType());
        interview.setInterviewerId(request.getInterviewerId());
        interview.setLocation(request.getLocation());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setStatus("SCHEDULED");

        Interview saved = interviewRepository.save(interview);

        // Update applicant status to INTERVIEW if not already
        if (!"INTERVIEW".equals(applicant.getStatus())) {
            applicant.setStatus("INTERVIEW");
            applicantRepository.save(applicant);
        }

        logger.info("Scheduled interview {} for applicant {}", saved.getId(), request.getApplicantId());
        return toDTO(saved);
    }

    /**
     * Get interviews for an applicant
     */
    @Transactional(readOnly = true)
    public List<InterviewDTO> getInterviewsByApplicant(Long applicantId) {
        return interviewRepository.findByApplicantIdOrderByInterviewDateDesc(applicantId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming interviews for a company
     */
    @Transactional(readOnly = true)
    public List<InterviewDTO> getUpcomingInterviews(Long companyId) {
        return interviewRepository.findUpcomingInterviews(companyId, LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get today's interviews for a company
     */
    @Transactional(readOnly = true)
    public List<InterviewDTO> getTodayInterviews(Long companyId) {
        return interviewRepository.findTodayInterviews(companyId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update interview feedback
     */
    @Transactional
    public InterviewDTO updateFeedback(Long interviewId, InterviewFeedbackRequest request) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        if (request.getStatus() != null) interview.setStatus(request.getStatus());
        if (request.getFeedback() != null) interview.setFeedback(request.getFeedback());
        if (request.getRating() != null) interview.setRating(request.getRating());

        Interview saved = interviewRepository.save(interview);
        logger.info("Updated interview {} feedback", interviewId);
        return toDTO(saved);
    }

    /**
     * Cancel an interview
     */
    @Transactional
    public InterviewDTO cancelInterview(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));
        interview.setStatus("CANCELLED");
        Interview saved = interviewRepository.save(interview);
        return toDTO(saved);
    }

    /**
     * Delete an interview
     */
    @Transactional
    public void deleteInterview(Long interviewId) {
        if (!interviewRepository.existsById(interviewId)) {
            throw new IllegalArgumentException("Interview not found");
        }
        interviewRepository.deleteById(interviewId);
    }

    /**
     * Convert entity to DTO
     */
    private InterviewDTO toDTO(Interview interview) {
        InterviewDTO dto = new InterviewDTO();
        dto.setId(interview.getId());
        dto.setApplicantId(interview.getApplicantId());
        dto.setInterviewDate(interview.getInterviewDate());
        dto.setInterviewType(interview.getInterviewType());
        dto.setInterviewerId(interview.getInterviewerId());
        dto.setLocation(interview.getLocation());
        dto.setMeetingLink(interview.getMeetingLink());
        dto.setStatus(interview.getStatus());
        dto.setFeedback(interview.getFeedback());
        dto.setRating(interview.getRating());

        // Get applicant name and job title
        applicantRepository.findById(interview.getApplicantId()).ifPresent(a -> {
            dto.setApplicantName(
                    (a.getFirstName() != null ? a.getFirstName() : "") + " " +
                    (a.getLastName() != null ? a.getLastName() : "")
            );
            jobPostingRepository.findById(a.getJobId()).ifPresent(j ->
                    dto.setJobTitle(j.getTitle())
            );
        });

        return dto;
    }
}