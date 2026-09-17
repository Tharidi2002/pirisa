package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    /**
     * Get all interviews for an applicant
     */
    List<Interview> findByApplicantIdOrderByInterviewDateDesc(Long applicantId);

    /**
     * Get upcoming interviews for a company
     */
    @Query("SELECT i FROM Interview i WHERE i.applicantId IN " +
           "(SELECT a.id FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId)) " +
           "AND i.interviewDate >= :now " +
           "AND i.status = 'SCHEDULED' " +
           "ORDER BY i.interviewDate ASC")
    List<Interview> findUpcomingInterviews(
            @Param("companyId") Long companyId,
            @Param("now") LocalDateTime now);

    /**
     * Get today's interviews for a company
     */
    @Query("SELECT i FROM Interview i WHERE i.applicantId IN " +
           "(SELECT a.id FROM Applicant a WHERE a.jobId IN " +
           "(SELECT j.id FROM JobPosting j WHERE j.companyId = :companyId)) " +
           "AND DATE(i.interviewDate) = CURRENT_DATE " +
           "ORDER BY i.interviewDate ASC")
    List<Interview> findTodayInterviews(@Param("companyId") Long companyId);

    /**
     * Get interviews by interviewer
     */
    List<Interview> findByInterviewerIdOrderByInterviewDateDesc(Long interviewerId);
}