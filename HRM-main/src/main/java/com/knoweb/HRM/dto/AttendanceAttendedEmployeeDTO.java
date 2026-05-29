package com.knoweb.HRM.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceAttendedEmployeeDTO {
    private Long empId;
    private String epfNo;
    private String firstName;
    private String lastName;
    private Long departmentId;
    private String departmentName;
    private String clockInTime;
    private String status;
    private String attendanceDate;
    private Long attendanceId;
}
