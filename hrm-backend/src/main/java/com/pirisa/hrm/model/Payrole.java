package com.pirisa.hrm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payrole")
public class Payrole implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payrole_id")
    private long id;

    private int year;

    private String month;

    private String allowance;

    @Column(name = "overtime_pay", precision = 19, scale = 2)
    @JsonProperty("overtime_pay")
    private BigDecimal overtimePay;

    @Column(name = "bonus_pay")
    @JsonProperty("bonus_pay")
    private String bonusPay;

    @Column(precision = 19, scale = 2)
    private BigDecimal appit;

    @Column(precision = 19, scale = 2)
    private BigDecimal loan;

    @Column(name = "other_deductions", precision = 19, scale = 2)
    @JsonProperty("other_deductions")
    private BigDecimal otherDeductions;

    @Column(name = "epf_8", precision = 19, scale = 2)
    @JsonProperty("epf_8")
    private BigDecimal epf8;

    @Column(name = "total_earnings", precision = 19, scale = 2)
    @JsonProperty("total_earnings")
    private BigDecimal totalEarnings;

    @Column(name = "total_deductions", precision = 19, scale = 2)
    @JsonProperty("total_deductions")
    private BigDecimal totalDeductions;

    @Column(name = "net_salary", precision = 19, scale = 2)
    @JsonProperty("net_salary")
    private BigDecimal netSalary;

    @Column(name = "basic_salary", precision = 19, scale = 2)
    @JsonProperty("basic_salary")
    private BigDecimal basicSalary;

    @Column(name = "emp_id")
    @JsonProperty("emp_id")
    private long empId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    private void normalizeMonetaryAmounts() {
        overtimePay = toCents(overtimePay);
        appit = toCents(appit);
        loan = toCents(loan);
        otherDeductions = toCents(otherDeductions);
        epf8 = toCents(epf8);
        totalEarnings = toCents(totalEarnings);
        totalDeductions = toCents(totalDeductions);
        netSalary = toCents(netSalary);
        basicSalary = toCents(basicSalary);
    }

    private static BigDecimal toCents(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount.setScale(2, RoundingMode.HALF_UP);
    }
}