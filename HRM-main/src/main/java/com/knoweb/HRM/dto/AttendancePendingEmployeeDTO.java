package com.knoweb.HRM.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendancePendingEmployeeDTO {
    private Long id;
    private String epfNo;
    private String firstName;
    private String lastName;
    private String dateOfJoining;
    private Long departmentId;
    private String departmentName;
}
