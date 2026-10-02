package com.pirisa.hrm.controller;

import com.pirisa.hrm.dto.CompanyDashboardSummaryDTO;
import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.User;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UserRepository;
import com.pirisa.hrm.service.CompanyDashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/company/dashboard")
public class CompanyDashboardController {
	private final CompanyDashboardService dashboardService;
	private final CompanyRepository companyRepository;
	private final UserRepository userRepository;
	private final EmployeeRepository employeeRepository;

	public CompanyDashboardController(
			CompanyDashboardService dashboardService,
			CompanyRepository companyRepository,
			UserRepository userRepository,
			EmployeeRepository employeeRepository) {
		this.dashboardService = dashboardService;
		this.companyRepository = companyRepository;
		this.userRepository = userRepository;
		this.employeeRepository = employeeRepository;
	}

	@GetMapping("/{companyId}/summary")
	public ResponseEntity<?> getCompanySummary(
			@PathVariable long companyId,
			Authentication authentication) {
		long authenticatedCompanyId = getAuthenticatedCompanyId(authentication.getName());
		if (authenticatedCompanyId <= 0 || authenticatedCompanyId != companyId) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Collections.singletonMap("message", "You cannot access this company's dashboard."));
		}

		CompanyDashboardSummaryDTO summary = dashboardService.getSummary(companyId);
		return ResponseEntity.ok(summary);
	}

	private long getAuthenticatedCompanyId(String username) {
		Company company = companyRepository.findByUsername(username);
		if (company != null) return company.getId();

		User user = userRepository.findByUsername(username);
		if (user != null && isCompanyAdministrator(user.getRole())) return user.getCmpId();

		Employee employee = employeeRepository.findByUsername(username);
		if (employee != null && isCompanyAdministrator(employee.getRole())) return employee.getCmpId();

		return -1;
	}

	private boolean isCompanyAdministrator(String role) {
		return "CMPNY".equalsIgnoreCase(role) || "HRM".equalsIgnoreCase(role);
	}
}
