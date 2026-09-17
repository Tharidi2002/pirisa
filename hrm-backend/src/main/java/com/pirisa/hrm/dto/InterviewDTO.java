package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDTO {
    private Long id;
    private Long applicantId;
    private String applicantName;
    private String jobTitle;
    private LocalDateTime interviewDate;
    private String interviewType;
    private Long interviewerId;
    private String interviewerName;
    private String location;
    private String meetingLink;
    private String status;
    private String feedback;
    private Integer rating;
}