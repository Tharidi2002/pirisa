package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "job_postings")
public class JobPosting extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "designation_id")
    private Long designationId;

    @Column(name = "employment_type", length = 50)
    private String employmentType; // FULL_TIME, PART_TIME, CONTRACT

    @Column(name = "experience_level", length = 50)
    private String experienceLevel; // ENTRY, MID, SENIOR

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    private Integer vacancies = 1;

    @Column(name = "posted_date")
    private LocalDateTime postedDate;

    @Column(name = "closing_date")
    private LocalDateTime closingDate;

    @Column(length = 50)
    private String status = "OPEN"; // OPEN, CLOSED, ON_HOLD

    @PrePersist
    protected void onPostPersist() {
        if (postedDate == null) {
            postedDate = LocalDateTime.now();
        }
    }
}