package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "salary_advances")
public class SalaryAdvance extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, PAID, RECOVERING, COMPLETED

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "repayment_months")
    private Integer repaymentMonths = 1;

    @Column(name = "monthly_deduction", precision = 12, scale = 2)
    private BigDecimal monthlyDeduction;

    @Column(name = "amount_recovered", precision = 12, scale = 2)
    private BigDecimal amountRecovered = BigDecimal.ZERO;
}