package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {

    @NotNull(message = "Applicant ID is required")
    private Long applicantId;

    @NotNull(message = "Interview date is required")
    @Future(message = "Interview date must be in the future")
    private LocalDateTime interviewDate;

    @NotBlank(message = "Interview type is required")
    @Pattern(regexp = "PHONE|VIDEO|IN_PERSON|TECHNICAL",
             message = "Interview type must be PHONE, VIDEO, IN_PERSON, or TECHNICAL")
    private String interviewType;

    private Long interviewerId;

    @Size(max = 200, message = "Location is too long")
    private String location;

    @Size(max = 500, message = "Meeting link is too long")
    private String meetingLink;
}