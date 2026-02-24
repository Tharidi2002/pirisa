package com.knoweb.HRM.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "employeeleave")
public class EmployeeLeave implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "empleave_id")
    private long id;

    @Column(name = "leave_type")
    private String leaveType;

    @Column(name = "leave_start_day")
    private LocalDateTime leaveStartDay;

    @Column(name = "leave_end_day")
    private LocalDateTime leaveEndDay;

    @Column(name = "leave_days")
    private int leaveDays;

    @Column(name = "leave_reason")
    private String leaveReason;

    @Column(name = "leave_status")
    private String leaveStatus = "PENDING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id")
    @JsonIgnore
    private Employee employee;
}
