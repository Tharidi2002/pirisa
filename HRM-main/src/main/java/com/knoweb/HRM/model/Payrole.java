package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.io.Serializable;
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

    @Column(name = "overtime_pay")
    private float overtimePay;

    @Column(name = "bonus_pay")
    private String bonusPay;

    private float appit;

    private float loan;

    @Column(name = "other_deductions")
    private float otherDeductions;

    @Column(name = "epf_8")
    private float epf8;

    @Column(name = "total_earnings")
    private float totalEarnings;

    @Column(name = "total_deductions")
    private float totalDeductions;

    @Column(name = "net_salary")
    private float netSalary;

    @Column(name = "basic_salary")
    private float basicSalary;

    @Column(name = "emp_id")
    private long empId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}
