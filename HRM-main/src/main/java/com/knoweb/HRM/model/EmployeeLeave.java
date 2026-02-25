package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employeeleave")
public class EmployeeLeave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "empleave_id")
    private long id;

    private String leaveType;

    private LocalDateTime leaveStartDay;

    private LocalDateTime leaveEndDay;

    private int leaveDays;

    private String leaveReason;

    private String leaveStatus = "PENDING";

    @Column(name = "emp_id")
    private long empId;

    @PrePersist
    @PreUpdate
    public void calculateLeaveDays() {
        if (leaveStartDay != null && leaveEndDay != null) {
            this.leaveDays = (int) ChronoUnit.DAYS.between(leaveStartDay, leaveEndDay) + 1;
        }
    }
}
