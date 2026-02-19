package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payment_slip")
public class PaymentSlip implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_slip_id")
    private Long id;

    @NotNull(message = "Employee ID is required")
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @NotNull(message = "Company ID is required")
    @Column(name = "cmp_id", nullable = false)
    private Long companyId;

    @NotNull(message = "Payment period is required")
    @Column(name = "payment_period", nullable = false)
    private String paymentPeriod;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.00", message = "Basic salary must be non-negative")
    @Column(name = "basic_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @DecimalMin(value = "0.00", message = "Allowances must be non-negative")
    @Column(name = "allowances", precision = 10, scale = 2)
    private BigDecimal allowances = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Overtime pay must be non-negative")
    @Column(name = "overtime_pay", precision = 10, scale = 2)
    private BigDecimal overtimePay = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Bonus must be non-negative")
    @Column(name = "bonus", precision = 10, scale = 2)
    private BigDecimal bonus = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Deductions must be non-negative")
    @Column(name = "deductions", precision = 10, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Tax must be non-negative")
    @Column(name = "tax", precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @NotNull(message = "Net salary is required")
    @DecimalMin(value = "0.00", message = "Net salary must be non-negative")
    @Column(name = "net_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "slip_number", unique = true)
    private String slipNumber;

    @Column(name = "notes")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING,
        PROCESSED,
        PAID,
        CANCELLED,
        FAILED
    }
}
