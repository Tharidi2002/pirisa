package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.AttendanceAttendedEmployeeDTO;
import com.pirisa.hrm.dto.AttendanceExcludedEmployeeDTO;
import com.pirisa.hrm.dto.AttendancePendingEmployeeDTO;
import com.pirisa.hrm.dto.BulkAttendanceDataDTO;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceReportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceValidator attendanceValidator;

    public BulkAttendanceDataDTO getBulkAttendanceData(LocalDate attendanceDate, long companyId, Long departmentId) {
        List<Employee> employees = employeeRepository.findEmployeesByCompanyIdWithDetails(companyId);
        if (departmentId != null && departmentId > 0) {
            employees = employees.stream()
                    .filter(e -> e.getDptId() == departmentId)
                    .collect(Collectors.toList());
        }

        List<Attendance> attendedRecords = attendanceRepository.findByAttendanceDateAndCompany(
                attendanceDate,
                companyId,
                departmentId != null && departmentId > 0 ? departmentId : null);

        Set<Long> attendedEmpIds = attendedRecords.stream()
                .map(Attendance::getEmpId)
                .collect(Collectors.toSet());

        Map<Long, Employee> employeeMap = employees.stream()
                .collect(Collectors.toMap(Employee::getId, e -> e));

        List<AttendancePendingEmployeeDTO> pendingEmployees = employees.stream()
                .filter(employee -> !attendedEmpIds.contains(employee.getId()))
                .filter(employee -> isEmployeeEligibleForAttendance(employee, attendanceDate))
                .map(this::toPendingEmployeeDTO)
                .collect(Collectors.toList());

        List<AttendanceExcludedEmployeeDTO> excludedEmployees = employees.stream()
                .filter(employee -> !isEmployeeEligibleForAttendance(employee, attendanceDate))
                .map(this::toExcludedEmployeeDTO)
                .collect(Collectors.toList());

        List<AttendanceAttendedEmployeeDTO> attendedEmployees = attendedRecords.stream()
                .map(attendance -> toAttendedEmployeeDTO(attendance, employeeMap.get(attendance.getEmpId())))
                .collect(Collectors.toList());

        return new BulkAttendanceDataDTO(pendingEmployees, attendedEmployees, excludedEmployees);
    }

    private boolean isEmployeeEligibleForAttendance(Employee employee, LocalDate attendanceDate) {
        LocalDate joinDate = attendanceValidator.parseEmployeeJoinDate(employee.getDateOfJoining());
        return joinDate != null && !attendanceDate.isBefore(joinDate);
    }

    private AttendancePendingEmployeeDTO toPendingEmployeeDTO(Employee employee) {
        return new AttendancePendingEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDateOfJoining(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getDptName() : "Unassigned"
        );
    }

    private AttendanceExcludedEmployeeDTO toExcludedEmployeeDTO(Employee employee) {
        return new AttendanceExcludedEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDateOfJoining(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getDptName() : "Unassigned"
        );
    }

    private AttendanceAttendedEmployeeDTO toAttendedEmployeeDTO(Attendance attendance, Employee employee) {
        String firstName = employee != null ? employee.getFirstName() : "Unknown";
        String lastName = employee != null ? employee.getLastName() : "";
        String epfNo = employee != null ? employee.getEpfNo() : null;
        Long deptId = employee != null && employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        String deptName = employee != null && employee.getDepartment() != null ? employee.getDepartment().getDptName() : "Unassigned";

        return new AttendanceAttendedEmployeeDTO(
                attendance.getEmpId(),
                epfNo,
                firstName,
                lastName,
                deptId,
                deptName,
                formatClockInTime(attendance.getStartedAt()),
                formatClockInTime(attendance.getEndedAt()),
                Optional.ofNullable(attendance.getWorking_status()).orElse(""),
                Optional.ofNullable(attendance.getAttendance_status()).orElse(""),
                attendance.getAttendanceDate() != null ? attendance.getAttendanceDate().format(DATE_FORMATTER) : "",
                attendance.getId()
        );
    }

    private String formatClockInTime(java.time.LocalDateTime startedAt) {
        return startedAt != null ? startedAt.format(DateTimeFormatter.ofPattern("HH:mm")) : "";
    }
}
