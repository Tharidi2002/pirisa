package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Applicant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {

    /**
     * Get all applicants for a specific job
     */
    List<Applicant> findByJobIdOrderByAppliedAtDesc(Long jobId);

    /**
     * Get applicants by job and status
     */
    List<Applicant> findByJobIdAndStatusOrderByAppliedAtDesc(Long jobId, String status);

    /**
     * Search applicants by name, email, or phone (within company's jobs)
     */
    @Query("SELECT a FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId) " +
           "AND (LOWER(a.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.phone) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.appliedAt DESC")
    List<Applicant> searchApplicants(
            @Param("companyId") Long companyId,
            @Param("query") String query);

    /**
     * Get all applicants for a company (across all jobs)
     */
    @Query("SELECT a FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId) " +
           "ORDER BY a.appliedAt DESC")
    List<Applicant> findByCompanyId(@Param("companyId") Long companyId);

    /**
     * Get applicants by company and status
     */
    @Query("SELECT a FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId) " +
           "AND a.status = :status " +
           "ORDER BY a.appliedAt DESC")
    List<Applicant> findByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") String status);

    /**
     * Check if email already applied for a job
     */
    boolean existsByJobIdAndEmail(Long jobId, String email);

    /**
     * Count applicants by company
     */
    @Query("SELECT COUNT(a) FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId)")
    long countByCompanyId(@Param("companyId") Long companyId);

    /**
     * Count applicants by company and status
     */
    @Query("SELECT COUNT(a) FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId) " +
           "AND a.status = :status")
    long countByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") String status);

    /**
     * Paginated applicants by job
     */
    Page<Applicant> findByJobId(Long jobId, Pageable pageable);
}