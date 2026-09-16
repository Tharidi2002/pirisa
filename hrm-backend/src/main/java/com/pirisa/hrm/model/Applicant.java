package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "applicants")
public class Applicant extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 20)
    private String nic;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "current_company", length = 200)
    private String currentCompany;

    @Column(name = "current_salary", precision = 12, scale = 2)
    private BigDecimal currentSalary;

    @Column(name = "expected_salary", precision = 12, scale = 2)
    private BigDecimal expectedSalary;

    @Column(name = "notice_period", length = 50)
    private String noticePeriod;

    @Column(length = 50)
    private String status = "NEW"; // NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED

    @Column(length = 100)
    private String source; // WEBSITE, REFERRAL, JOB_BOARD

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;

    @PrePersist
    protected void onPostPersist() {
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
    }
}