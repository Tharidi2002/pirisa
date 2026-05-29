package com.knoweb.HRM.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.Locale;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"emp_id", "attendance_date"})
})
public class Attendance implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "atdnc_id")
    private long id;

    // Attendance date allows recording backdated entries from the employee's joining date.
    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    // Employee reference used for daily uniqueness and filtering.
    @Column(name = "emp_id")
    private long empId;

    private String working_status;

    @Column(name = "total_time")
    private float totalTime;

    private String attendance_status;

    // Source of the attendance record for auditing: AUTO_CLOCK, MANUAL_HR, EXCEL_IMPORT, etc.
    @Column(name = "entry_type")
    private String entryType;

    // User or system identifier that created/modified this attendance entry.
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "day_name")
    private String dayName;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "atdnc_id", referencedColumnName = "atdnc_id", insertable = false, updatable = false)
    private Additional_attendance additional_attendance;


    @PrePersist
    @PreUpdate
    public void calculateTotalTime() {
        if (this.startedAt != null) {
            this.dayName = this.startedAt.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();
        }
        if (this.startedAt != null && this.endedAt != null) {
            Duration duration = Duration.between(this.startedAt, this.endedAt);
            this.totalTime = duration.toMinutes();
        } else {
            this.totalTime = 0;
        }
    }
}
