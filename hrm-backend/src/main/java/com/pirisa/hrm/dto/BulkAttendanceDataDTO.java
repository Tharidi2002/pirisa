package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkAttendanceDataDTO {
    private List<AttendancePendingEmployeeDTO> pendingEmployees;
    private List<AttendanceAttendedEmployeeDTO> attendedEmployees;
    private List<AttendanceExcludedEmployeeDTO> excludedEmployees;
}
