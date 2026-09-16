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
@Table(name = "employee_onboarding_tasks")
public class EmployeeOnboardingTask extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "onboarding_id", nullable = false)
    private Long onboardingId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category; // DOCUMENT, TRAINING, IT_SETUP, COMPLIANCE

    @Column(name = "assigned_to", length = 50)
    private String assignedTo; // HR, MANAGER, IT, EMPLOYEE

    @Column(name = "due_date")
    private LocalDate dueDate;

    private Boolean completed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by")
    private Long completedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}