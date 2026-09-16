package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employee_onboarding")
public class EmployeeOnboarding extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Column(length = 50)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;
}