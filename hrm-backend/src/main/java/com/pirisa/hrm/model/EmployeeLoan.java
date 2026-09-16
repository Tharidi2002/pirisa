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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employee_loans")
public class EmployeeLoan extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "loan_type", length = 50)
    private String loanType; // PERSONAL, VEHICLE, HOUSING, EDUCATION

    @Column(name = "principal_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "monthly_installment", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyInstallment;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(length = 50)
    private String status = "PENDING"; // PENDING, ACTIVE, COMPLETED, DEFAULTED

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "remaining_amount", precision = 12, scale = 2)
    private BigDecimal remainingAmount;
}