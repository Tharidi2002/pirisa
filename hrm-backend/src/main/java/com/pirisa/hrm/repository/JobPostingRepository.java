package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    /**
     * Get all job postings for a company
     */
    List<JobPosting> findByCompanyIdOrderByPostedDateDesc(Long companyId);

    /**
     * Get job postings by company and status
     */
    List<JobPosting> findByCompanyIdAndStatusOrderByPostedDateDesc(Long companyId, String status);

    /**
     * Search job postings by title
     */
    @Query("SELECT j FROM JobPosting j WHERE j.companyId = :companyId " +
           "AND LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY j.postedDate DESC")
    List<JobPosting> searchByTitle(
            @Param("companyId") Long companyId,
            @Param("query") String query);

    /**
     * Get open job postings for a company
     */
    @Query("SELECT j FROM JobPosting j WHERE j.companyId = :companyId " +
           "AND j.status = 'OPEN' " +
           "AND (j.closingDate IS NULL OR j.closingDate > :now) " +
           "ORDER BY j.postedDate DESC")
    List<JobPosting> findOpenJobs(
            @Param("companyId") Long companyId,
            @Param("now") LocalDateTime now);

    /**
     * Get paginated job postings
     */
    Page<JobPosting> findByCompanyId(Long companyId, Pageable pageable);

    /**
     * Count jobs by status
     */
    long countByCompanyIdAndStatus(Long companyId, String status);
}