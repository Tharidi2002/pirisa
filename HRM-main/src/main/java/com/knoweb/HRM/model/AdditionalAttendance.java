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
@Table(name = "additional_attendance")
public class AdditionalAttendance implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "additional_atdnc_id")
    private long id;

    @Column(name = "travel_start")
    private LocalDateTime travelStart;

    @Column(name = "travel_end")
    private LocalDateTime travelEnd;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atdnc_id")
    @JsonIgnore
    private Attendance attendance;
}
