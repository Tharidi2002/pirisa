package com.pirisa.hrm.model;

import com.pirisa.hrm.model.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shifts")
public class Shift extends BaseEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false, length = 100)
    private String name; // Morning, Evening, Night

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "break_duration_minutes")
    private Integer breakDurationMinutes = 60;

    @Column(name = "is_night_shift")
    private Boolean isNightShift = false;

    @Column(name = "grace_period_minutes")
    private Integer gracePeriodMinutes = 15;

    @Column(length = 20)
    private String color;

    @Column(name = "is_active")
    private Boolean isActive = true;
}