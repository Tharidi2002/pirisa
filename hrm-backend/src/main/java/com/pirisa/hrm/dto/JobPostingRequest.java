package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPostingRequest {

    @NotBlank(message = "Job title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 5000, message = "Description is too long")
    private String description;

    private Long departmentId;

    private Long designationId;

    @Pattern(regexp = "FULL_TIME|PART_TIME|CONTRACT|INTERN",
             message = "Employment type must be FULL_TIME, PART_TIME, CONTRACT, or INTERN")
    private String employmentType;

    @Pattern(regexp = "ENTRY|MID|SENIOR|LEAD",
             message = "Experience level must be ENTRY, MID, SENIOR, or LEAD")
    private String experienceLevel;

    @DecimalMin(value = "0.0", message = "Minimum salary cannot be negative")
    private BigDecimal salaryMin;

    @DecimalMin(value = "0.0", message = "Maximum salary cannot be negative")
    private BigDecimal salaryMax;

    @Size(max = 200, message = "Location is too long")
    private String location;

    @Min(value = 1, message = "At least 1 vacancy is required")
    private Integer vacancies;

    private LocalDateTime closingDate;

    @Pattern(regexp = "OPEN|CLOSED|ON_HOLD", message = "Status must be OPEN, CLOSED, or ON_HOLD")
    private String status;
}