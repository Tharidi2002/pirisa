package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackRequest {

    @Pattern(regexp = "SCHEDULED|COMPLETED|CANCELLED|NO_SHOW",
             message = "Invalid status")
    private String status;

    @Size(max = 5000, message = "Feedback is too long")
    private String feedback;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;
}