package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.JobPostingDTO;
import com.pirisa.hrm.dto.JobPostingRequest;
import com.pirisa.hrm.model.Designation;
import com.pirisa.hrm.model.JobPosting;
import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.repository.ApplicantRepository;
import com.pirisa.hrm.repository.DesignationRepository;
import com.pirisa.hrm.repository.JobPostingRepository;
import com.pirisa.hrm.repository.UnitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostingService {

    private static final Logger logger = LoggerFactory.getLogger(JobPostingService.class);

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private DesignationRepository designationRepository;

    /**
     * Create a new job posting
     */
    @Transactional
    public JobPostingDTO createJob(Long companyId, JobPostingRequest request) {
        if (request.getSalaryMin() != null && request.getSalaryMax() != null
                && request.getSalaryMin().compareTo(request.getSalaryMax()) > 0) {
            throw new IllegalArgumentException("Minimum salary cannot be greater than maximum salary");
        }

        JobPosting job = new JobPosting();
        job.setCompanyId(companyId);
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription());
        job.setDepartmentId(request.getDepartmentId());
        job.setDesignationId(request.getDesignationId());
        job.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "FULL_TIME");
        job.setExperienceLevel(request.getExperienceLevel() != null ? request.getExperienceLevel() : "MID");
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setLocation(request.getLocation());
        job.setVacancies(request.getVacancies() != null ? request.getVacancies() : 1);
        job.setClosingDate(request.getClosingDate());
        job.setStatus(request.getStatus() != null ? request.getStatus() : "OPEN");
        job.setPostedDate(LocalDateTime.now());

        JobPosting saved = jobPostingRepository.save(job);
        logger.info("Created job posting {} for company {}", saved.getId(), companyId);
        return toDTO(saved);
    }

    /**
     * Get all job postings for a company
     */
    @Transactional(readOnly = true)
    public List<JobPostingDTO> getJobsByCompany(Long companyId) {
        return jobPostingRepository.findByCompanyIdOrderByPostedDateDesc(companyId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get job by ID
     */
    @Transactional(readOnly = true)
    public JobPostingDTO getJobById(Long jobId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));
        return toDTO(job);
    }

    /**
     * Update a job posting
     */
    @Transactional
    public JobPostingDTO updateJob(Long jobId, JobPostingRequest request) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            job.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getDepartmentId() != null) job.setDepartmentId(request.getDepartmentId());
        if (request.getDesignationId() != null) job.setDesignationId(request.getDesignationId());
        if (request.getEmploymentType() != null) job.setEmploymentType(request.getEmploymentType());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        if (request.getSalaryMin() != null) job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null) job.setSalaryMax(request.getSalaryMax());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getVacancies() != null) job.setVacancies(request.getVacancies());
        if (request.getClosingDate() != null) job.setClosingDate(request.getClosingDate());
        if (request.getStatus() != null) job.setStatus(request.getStatus());

        JobPosting saved = jobPostingRepository.save(job);
        logger.info("Updated job posting {}", jobId);
        return toDTO(saved);
    }

    /**
     * Delete a job posting
     */
    @Transactional
    public void deleteJob(Long jobId) {
        if (!jobPostingRepository.existsById(jobId)) {
            throw new IllegalArgumentException("Job posting not found");
        }
        jobPostingRepository.deleteById(jobId);
        logger.info("Deleted job posting {}", jobId);
    }

    /**
     * Update job status
     */
    @Transactional
    public JobPostingDTO updateJobStatus(Long jobId, String status) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));
        job.setStatus(status);
        JobPosting saved = jobPostingRepository.save(job);
        return toDTO(saved);
    }

    /**
     * Get open jobs
     */
    @Transactional(readOnly = true)
    public List<JobPostingDTO> getOpenJobs(Long companyId) {
        return jobPostingRepository.findOpenJobs(companyId, LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search jobs
     */
    @Transactional(readOnly = true)
    public List<JobPostingDTO> searchJobs(Long companyId, String query) {
        return jobPostingRepository.searchByTitle(companyId, query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO
     */
    private JobPostingDTO toDTO(JobPosting job) {
        JobPostingDTO dto = new JobPostingDTO();
        dto.setId(job.getId());
        dto.setCompanyId(job.getCompanyId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setDepartmentId(job.getDepartmentId());
        dto.setDesignationId(job.getDesignationId());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setLocation(job.getLocation());
        dto.setVacancies(job.getVacancies());
        dto.setPostedDate(job.getPostedDate());
        dto.setClosingDate(job.getClosingDate());
        dto.setStatus(job.getStatus());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());

        // Get department name
        if (job.getDepartmentId() != null) {
            unitRepository.findById(job.getDepartmentId())
                    .ifPresent(d -> dto.setDepartmentName(d.getDptName()));
        }

        // Get designation name
        if (job.getDesignationId() != null) {
            designationRepository.findById(job.getDesignationId())
                    .ifPresent(d -> dto.setDesignationName(d.getDesignation()));
        }

        // Count applicants
        dto.setApplicantCount((long) applicantRepository.findByJobIdOrderByAppliedAtDesc(job.getId()).size());

        return dto;
    }
}