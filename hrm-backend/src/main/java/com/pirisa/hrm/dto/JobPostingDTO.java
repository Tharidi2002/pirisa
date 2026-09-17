package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostingDTO {
    private Long id;
    private Long companyId;
    private String title;
    private String description;
    private Long departmentId;
    private String departmentName;
    private Long designationId;
    private String designationName;
    private String employmentType;
    private String experienceLevel;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String location;
    private Integer vacancies;
    private LocalDateTime postedDate;
    private LocalDateTime closingDate;
    private String status;
    private Long applicantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}