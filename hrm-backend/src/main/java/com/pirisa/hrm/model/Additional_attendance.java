package com.pirisa.hrm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "additional_attendance")
public class Additional_attendance implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "additional_atdnc_id")
    private long id;

    private LocalDateTime travel_start;

    private LocalDateTime travel_end;

    private long atdnc_id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atdnc_id", referencedColumnName = "atdnc_id", insertable = false, updatable = false)
    private Attendance attendance;


}
