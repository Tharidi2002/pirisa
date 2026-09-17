package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.ApplicantDTO;
import com.pirisa.hrm.dto.ApplicantRequest;
import com.pirisa.hrm.dto.ApplicantStatusUpdateRequest;
import com.pirisa.hrm.model.Applicant;
import com.pirisa.hrm.model.JobPosting;
import com.pirisa.hrm.repository.ApplicantRepository;
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
public class ApplicantService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicantService.class);

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    /**
     * Create a new applicant
     */
    @Transactional
    public ApplicantDTO createApplicant(ApplicantRequest request) {
        // Validate job exists
        JobPosting job = jobPostingRepository.findById(request.getJobId())
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        // Check if already applied
        if (applicantRepository.existsByJobIdAndEmail(request.getJobId(), request.getEmail())) {
            throw new IllegalArgumentException("An application with this email already exists for this job");
        }

        // Check if job is open
        if (!"OPEN".equals(job.getStatus())) {
            throw new IllegalArgumentException("This job is not currently accepting applications");
        }

        Applicant applicant = new Applicant();
        applicant.setJobId(request.getJobId());
        applicant.setFirstName(request.getFirstName().trim());
        applicant.setLastName(request.getLastName());
        applicant.setEmail(request.getEmail().trim().toLowerCase());
        applicant.setPhone(request.getPhone());
        applicant.setAddress(request.getAddress());
        applicant.setNic(request.getNic());
        applicant.setDateOfBirth(request.getDateOfBirth());
        applicant.setGender(request.getGender());
        applicant.setResumeUrl(request.getResumeUrl());
        applicant.setCoverLetter(request.getCoverLetter());
        applicant.setExperienceYears(request.getExperienceYears());
        applicant.setCurrentCompany(request.getCurrentCompany());
        applicant.setCurrentSalary(request.getCurrentSalary());
        applicant.setExpectedSalary(request.getExpectedSalary());
        applicant.setNoticePeriod(request.getNoticePeriod());
        applicant.setSource(request.getSource() != null ? request.getSource() : "WEBSITE");
        applicant.setNotes(request.getNotes());
        applicant.setStatus("NEW");
        applicant.setAppliedAt(LocalDateTime.now());

        Applicant saved = applicantRepository.save(applicant);
        logger.info("Created applicant {} for job {}", saved.getId(), request.getJobId());
        return toDTO(saved);
    }

    /**
     * Get all applicants for a company
     */
    @Transactional(readOnly = true)
    public List<ApplicantDTO> getApplicantsByCompany(Long companyId) {
        return applicantRepository.findByCompanyId(companyId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get applicants for a specific job
     */
    @Transactional(readOnly = true)
    public List<ApplicantDTO> getApplicantsByJob(Long jobId) {
        return applicantRepository.findByJobIdOrderByAppliedAtDesc(jobId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get applicants by company and status
     */
    @Transactional(readOnly = true)
    public List<ApplicantDTO> getApplicantsByStatus(Long companyId, String status) {
        return applicantRepository.findByCompanyIdAndStatus(companyId, status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get applicant by ID
     */
    @Transactional(readOnly = true)
    public ApplicantDTO getApplicantById(Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found"));
        return toDTO(applicant);
    }

    /**
     * Update applicant status
     */
    @Transactional
    public ApplicantDTO updateApplicantStatus(Long applicantId, ApplicantStatusUpdateRequest request) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found"));

        applicant.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            applicant.setNotes(request.getNotes());
        }

        Applicant saved = applicantRepository.save(applicant);
        logger.info("Updated applicant {} status to {}", applicantId, request.getStatus());
        return toDTO(saved);
    }

    /**
     * Update applicant details
     */
    @Transactional
    public ApplicantDTO updateApplicant(Long applicantId, ApplicantRequest request) {
        Applicant applicant = applicantRepository.findById(applicantId)
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found"));

        if (request.getFirstName() != null) applicant.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) applicant.setLastName(request.getLastName());
        if (request.getEmail() != null) applicant.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getPhone() != null) applicant.setPhone(request.getPhone());
        if (request.getAddress() != null) applicant.setAddress(request.getAddress());
        if (request.getNic() != null) applicant.setNic(request.getNic());
        if (request.getDateOfBirth() != null) applicant.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) applicant.setGender(request.getGender());
        if (request.getResumeUrl() != null) applicant.setResumeUrl(request.getResumeUrl());
        if (request.getCoverLetter() != null) applicant.setCoverLetter(request.getCoverLetter());
        if (request.getExperienceYears() != null) applicant.setExperienceYears(request.getExperienceYears());
        if (request.getCurrentCompany() != null) applicant.setCurrentCompany(request.getCurrentCompany());
        if (request.getCurrentSalary() != null) applicant.setCurrentSalary(request.getCurrentSalary());
        if (request.getExpectedSalary() != null) applicant.setExpectedSalary(request.getExpectedSalary());
        if (request.getNoticePeriod() != null) applicant.setNoticePeriod(request.getNoticePeriod());
        if (request.getSource() != null) applicant.setSource(request.getSource());
        if (request.getNotes() != null) applicant.setNotes(request.getNotes());

        Applicant saved = applicantRepository.save(applicant);
        return toDTO(saved);
    }

    /**
     * Delete an applicant
     */
    @Transactional
    public void deleteApplicant(Long applicantId) {
        if (!applicantRepository.existsById(applicantId)) {
            throw new IllegalArgumentException("Applicant not found");
        }
        applicantRepository.deleteById(applicantId);
        logger.info("Deleted applicant {}", applicantId);
    }

    /**
     * Search applicants
     */
    @Transactional(readOnly = true)
    public List<ApplicantDTO> searchApplicants(Long companyId, String query) {
        return applicantRepository.searchApplicants(companyId, query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO
     */
    private ApplicantDTO toDTO(Applicant applicant) {
        ApplicantDTO dto = new ApplicantDTO();
        dto.setId(applicant.getId());
        dto.setJobId(applicant.getJobId());
        dto.setFirstName(applicant.getFirstName());
        dto.setLastName(applicant.getLastName());
        dto.setEmail(applicant.getEmail());
        dto.setPhone(applicant.getPhone());
        dto.setAddress(applicant.getAddress());
        dto.setNic(applicant.getNic());
        dto.setDateOfBirth(applicant.getDateOfBirth());
        dto.setGender(applicant.getGender());
        dto.setResumeUrl(applicant.getResumeUrl());
        dto.setCoverLetter(applicant.getCoverLetter());
        dto.setExperienceYears(applicant.getExperienceYears());
        dto.setCurrentCompany(applicant.getCurrentCompany());
        dto.setCurrentSalary(applicant.getCurrentSalary());
        dto.setExpectedSalary(applicant.getExpectedSalary());
        dto.setNoticePeriod(applicant.getNoticePeriod());
        dto.setStatus(applicant.getStatus());
        dto.setSource(applicant.getSource());
        dto.setNotes(applicant.getNotes());
        dto.setAppliedAt(applicant.getAppliedAt());
        dto.setUpdatedAt(applicant.getUpdatedAt());
        dto.setFullName((applicant.getFirstName() != null ? applicant.getFirstName() : "") +
                " " + (applicant.getLastName() != null ? applicant.getLastName() : ""));

        // Get job title
        jobPostingRepository.findById(applicant.getJobId())
                .ifPresent(j -> dto.setJobTitle(j.getTitle()));

        return dto;
    }
}