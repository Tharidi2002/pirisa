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
@Table(name = "attendance")
public class Attendance implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "atdnc_id")
    private long id;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "working_status")
    private String workingStatus;

    @Column(name = "total_time")
    private float totalTime;

    @Column(name = "attendance_status")
    private String attendanceStatus;

    @Column(name = "day_name")
    private String dayName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id")
    @JsonIgnore
    private Employee employee;

    @OneToOne(mappedBy = "attendance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AdditionalAttendance additionalAttendance;
}
