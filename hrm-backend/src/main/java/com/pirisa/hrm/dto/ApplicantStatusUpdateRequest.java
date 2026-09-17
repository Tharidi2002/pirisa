package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "NEW|SCREENING|INTERVIEW|OFFER|HIRED|REJECTED",
             message = "Status must be NEW, SCREENING, INTERVIEW, OFFER, HIRED, or REJECTED")
    private String status;

    @Size(max = 2000, message = "Notes are too long")
    private String notes;
}