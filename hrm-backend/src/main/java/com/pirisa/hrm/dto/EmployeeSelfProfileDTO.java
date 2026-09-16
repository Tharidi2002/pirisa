package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSelfProfileDTO {
    private Long id;
    private String epfNo;
    private String empNo;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String gender;
    private String dob;
    private String nic;
    private String dateOfJoining;
    private String status;
    private String departmentName;
    private String designationName;
    private String basicSalary;
    private boolean hasProfileImage;
}