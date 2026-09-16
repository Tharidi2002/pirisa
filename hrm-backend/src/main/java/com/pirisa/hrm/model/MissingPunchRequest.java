package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "missing_punch_requests")
public class MissingPunchRequest extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "punch_type", nullable = false, length = 20)
    private String punchType; // CLOCK_IN, CLOCK_OUT, BOTH

    @Column(name = "requested_started_at")
    private LocalTime requestedStartedAt;

    @Column(name = "requested_ended_at")
    private LocalTime requestedEndedAt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}