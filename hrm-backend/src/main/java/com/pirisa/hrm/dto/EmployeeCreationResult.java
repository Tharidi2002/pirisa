package com.pirisa.hrm.dto;

import com.pirisa.hrm.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeCreationResult {
    private final Employee employee;
    private final boolean emailSent;
}
