package com.knoweb.HRM.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetailsDTO {

    private Long id;

    private String cmpName;

    private String cmpAddress;

    private String cmpPhone;

    private String cmpEmail;

    private String username;

    private String cmpRegNo;

    private String vatNo;

    private String tinNo;

    private String role;

    private String packageName;

    private String companyStatus;
}
