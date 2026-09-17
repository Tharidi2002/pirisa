package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name is too long")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^[0-9+\\-\\s]*$", message = "Invalid phone number format")
    private String phone;

    @Size(max = 500, message = "Address is too long")
    private String address;

    @Size(max = 20, message = "NIC is too long")
    private String nic;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "MALE|FEMALE|OTHER|", message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    private String resumeUrl;

    @Size(max = 2000, message = "Cover letter is too long")
    private String coverLetter;

    @Min(value = 0, message = "Experience years cannot be negative")
    private Integer experienceYears;

    @Size(max = 200, message = "Current company is too long")
    private String currentCompany;

    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal currentSalary;

    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private BigDecimal expectedSalary;

    @Size(max = 50, message = "Notice period is too long")
    private String noticePeriod;

    @Pattern(regexp = "WEBSITE|REFERRAL|JOB_BOARD|WALK_IN|OTHER",
             message = "Invalid source")
    private String source;

    @Size(max = 2000, message = "Notes are too long")
    private String notes;
}