package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String nic;
    private LocalDate dateOfBirth;
    private String gender;
    private String resumeUrl;
    private String coverLetter;
    private Integer experienceYears;
    private String currentCompany;
    private BigDecimal currentSalary;
    private BigDecimal expectedSalary;
    private String noticePeriod;
    private String status;
    private String source;
    private String notes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private String fullName;
}