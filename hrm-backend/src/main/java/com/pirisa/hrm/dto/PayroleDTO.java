package com.pirisa.hrm.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PayroleDTO {

    private Long id;

    private int year;

    private String month;

    private String allowance;

    private BigDecimal overtime_pay;

    private String bonus_pay;

    private BigDecimal appit;

    private BigDecimal loan;

    private BigDecimal other_deductions;

    private BigDecimal epf_8;

    private BigDecimal total_earnings;

    private BigDecimal total_deductions;

    private BigDecimal net_salary;

    private BigDecimal basic_salary;

}
