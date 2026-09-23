package com.pirisa.hrm.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestDTO {
    private String fullName;
    private String email;
    private String phone;
    private String companyName;
    private String teamSize;
    private String message;
}
