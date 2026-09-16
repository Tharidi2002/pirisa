package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "interviews")
public class Interview extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "applicant_id", nullable = false)
    private Long applicantId;

    @Column(name = "interview_date", nullable = false)
    private LocalDateTime interviewDate;

    @Column(name = "interview_type", length = 50)
    private String interviewType; // PHONE, VIDEO, IN_PERSON, TECHNICAL

    @Column(name = "interviewer_id")
    private Long interviewerId;

    @Column(length = 200)
    private String location;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(length = 50)
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Integer rating; // 1-5
}