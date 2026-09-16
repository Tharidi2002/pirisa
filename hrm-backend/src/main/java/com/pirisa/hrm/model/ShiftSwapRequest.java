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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shift_swap_requests")
public class ShiftSwapRequest extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requester_employee_id", nullable = false)
    private Long requesterEmployeeId;

    @Column(name = "target_employee_id", nullable = false)
    private Long targetEmployeeId;

    @Column(name = "requester_shift_id", nullable = false)
    private Long requesterShiftId;

    @Column(name = "target_shift_id", nullable = false)
    private Long targetShiftId;

    @Column(name = "swap_date", nullable = false)
    private LocalDate swapDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}