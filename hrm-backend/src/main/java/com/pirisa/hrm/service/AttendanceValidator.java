package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Component
public class AttendanceValidator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public void validateAttendanceJoinDate(Attendance attendance, EmployeeRepository employeeRepository) {
        if (attendance == null || attendance.getAttendanceDate() == null || attendance.getEmpId() <= 0) {
            throw new IllegalArgumentException("Invalid attendance record provided");
        }

        Employee employee = employeeRepository.findById(attendance.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("Cannot validate attendance: employee not found."));

        LocalDate joinDate = parseEmployeeJoinDate(employee.getDateOfJoining());
        if (joinDate != null && attendance.getAttendanceDate().isBefore(joinDate)) {
            throw new IllegalArgumentException(
                    "Cannot mark attendance for employee " + employee.getEpfNo() + " prior to the join date.");
        }
    }

    public LocalDate parseEmployeeJoinDate(String dateOfJoining) {
        if (dateOfJoining == null || dateOfJoining.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateOfJoining, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
