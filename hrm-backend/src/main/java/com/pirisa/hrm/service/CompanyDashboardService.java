package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.CompanyDashboardSummaryDTO;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeLeaveRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CompanyDashboardService {
    private static final List<DateTimeFormatter> JOIN_DATE_FORMATS = List.of(
	    DateTimeFormatter.ISO_LOCAL_DATE,
	    DateTimeFormatter.ofPattern("dd/MM/yyyy"),
	    DateTimeFormatter.ofPattern("dd-MM-yyyy")
    );

    private final EmployeeRepository employeeRepository;
    private final EmployeeLeaveRepository employeeLeaveRepository;
    private final AttendanceRepository attendanceRepository;

    public CompanyDashboardService(
	    EmployeeRepository employeeRepository,
	    EmployeeLeaveRepository employeeLeaveRepository,
	    AttendanceRepository attendanceRepository) {
	this.employeeRepository = employeeRepository;
	this.employeeLeaveRepository = employeeLeaveRepository;
	this.attendanceRepository = attendanceRepository;
    }

    @Transactional(readOnly = true)
    public CompanyDashboardSummaryDTO getSummary(long companyId) {
	LocalDate today = LocalDate.now();
	LocalDate activityStart = today.minusDays(29);
	List<Employee> employees = employeeRepository.findEmployeesByCompanyIdWithDetails(companyId);
	List<Attendance> attendance = attendanceRepository.findForCompanyBetweenDates(
		companyId,
		activityStart,
		today,
		activityStart.atStartOfDay(),
		today.plusDays(1).atStartOfDay()
	);

	CompanyDashboardSummaryDTO summary = new CompanyDashboardSummaryDTO();
	summary.setTotalEmployees(employees.size());
	summary.setActiveEmployees(employees.stream().filter(this::isActive).count());
	summary.setPendingLeaves(employeeLeaveRepository.countByLeaveStatusAndCompanyId(
		"PENDING", companyId));
	summary.setNewHiresThisMonth(employees.stream()
		.map(employee -> parseJoinDate(employee.getDateOfJoining()))
		.filter(joinDate -> joinDate != null
			&& joinDate.getYear() == today.getYear()
			&& joinDate.getMonth() == today.getMonth())
		.count());

	Map<String, Long> departmentCounts = employees.stream()
		.filter(this::isActive)
		.collect(Collectors.groupingBy(
			employee -> employee.getDepartment() == null
				|| employee.getDepartment().getDptName() == null
				|| employee.getDepartment().getDptName().isBlank()
				? "Unassigned"
				: employee.getDepartment().getDptName().trim(),
			LinkedHashMap::new,
			Collectors.counting()
		));
	List<CompanyDashboardSummaryDTO.DepartmentHeadcount> departments = departmentCounts.entrySet()
		.stream()
		.map(entry -> new CompanyDashboardSummaryDTO.DepartmentHeadcount(
			entry.getKey(), entry.getValue()))
		.sorted(Comparator.comparingLong(
			CompanyDashboardSummaryDTO.DepartmentHeadcount::getCount).reversed())
		.collect(Collectors.toList());
	summary.setDepartmentHeadcount(departments);

	Map<Long, Employee> employeesById = employees.stream()
		.collect(Collectors.toMap(Employee::getId, employee -> employee));
	List<CompanyDashboardSummaryDTO.RecentActivity> activities = new ArrayList<>();

	for (Employee employee : employees) {
	    LocalDate joinDate = parseJoinDate(employee.getDateOfJoining());
	    if (joinDate != null
		    && !joinDate.isBefore(activityStart)
		    && !joinDate.isAfter(today)) {
		activities.add(new CompanyDashboardSummaryDTO.RecentActivity(
			"employee-" + employee.getId(),
			"employee",
			"New employee joined",
			employeeName(employee),
			joinDate.atStartOfDay(),
			false
		));
	    }
	}

	for (Attendance record : attendance) {
	    Employee employee = employeesById.get(record.getEmpId());
	    if (employee == null) continue;

	    LocalDateTime occurredAt = record.getStartedAt() != null
		    ? record.getStartedAt()
		    : record.getAttendanceDate() != null
		    ? record.getAttendanceDate().atStartOfDay()
		    : null;
	    if (occurredAt == null) continue;

	    String status = normalize(record.getAttendance_status());
	    activities.add(new CompanyDashboardSummaryDTO.RecentActivity(
		    "attendance-" + record.getId(),
		    "attendance",
		    "LATE".equals(status) || "LATE".equals(normalize(record.getWorking_status()))
			    ? "Late check-in recorded"
			    : "Attendance recorded",
		    employeeName(employee),
		    occurredAt,
		    record.getStartedAt() != null
	    ));
	}

	long presentToday = attendance.stream()
		.filter(record -> {
		    LocalDate attendanceDate = record.getAttendanceDate() != null
			    ? record.getAttendanceDate()
			    : record.getStartedAt() != null
			    ? record.getStartedAt().toLocalDate()
			    : null;
		    return today.equals(attendanceDate)
			    && isPresentStatus(record.getAttendance_status(), record.getWorking_status());
		})
		.map(Attendance::getEmpId)
		.distinct()
		.count();
	summary.setPresentToday(presentToday);

	activities.sort(Comparator.comparing(
		CompanyDashboardSummaryDTO.RecentActivity::getOccurredAt).reversed());
	summary.setRecentActivity(activities.stream().limit(5).collect(Collectors.toList()));
	return summary;
    }

    private boolean isActive(Employee employee) {
	return "ACTIVE".equalsIgnoreCase(employee.getStatus());
    }

    private boolean isPresentStatus(String attendanceStatus, String workingStatus) {
	String attendance = normalize(attendanceStatus);
	String working = normalize(workingStatus);
	return "PRESENT".equals(attendance)
		|| "LATE".equals(attendance)
		|| "LATE".equals(working);
    }

    private String normalize(String value) {
	return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String employeeName(Employee employee) {
	String name = ((employee.getFirstName() == null ? "" : employee.getFirstName()) + " "
		+ (employee.getLastName() == null ? "" : employee.getLastName())).trim();
	return name.isEmpty() ? "Employee" : name;
    }

    private LocalDate parseJoinDate(String value) {
	if (value == null || value.isBlank()) return null;
	for (DateTimeFormatter formatter : JOIN_DATE_FORMATS) {
	    try {
		return LocalDate.parse(value.trim(), formatter);
	    } catch (DateTimeParseException ignored) {
		// Try the next supported legacy date format.
	    }
	}
	return null;
    }
}
