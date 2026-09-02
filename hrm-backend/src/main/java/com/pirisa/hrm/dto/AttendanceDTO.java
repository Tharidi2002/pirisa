package com.pirisa.hrm.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AttendanceDTO {
    private Long id;
    private LocalDate attendanceDate;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String working_status;
    private String attendance_status;
    private float totalTime;
    private String dayName;
}
