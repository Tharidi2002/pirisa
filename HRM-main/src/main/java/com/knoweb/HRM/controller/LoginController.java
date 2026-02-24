package com.knoweb.HRM.controller;

import com.knoweb.HRM.model.Company;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.repository.CompanyRepository;
import com.knoweb.HRM.repository.EmployeeRepository;
import com.knoweb.HRM.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/company")
    public ResponseEntity<?> loginCompany(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Company company = companyRepository.findByUsername(username);

        if (company == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        if (passwordEncoder.matches(password, company.getCmpPassword())) { // Corrected method call
            final String token = jwtTokenUtil.generateToken(username, "COMPANY");

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Company login successful");
            response.put("token", token);
            response.put("companyId", company.getId());

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/employee")
    public ResponseEntity<?> loginEmployee(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Employee employee = employeeRepository.findByEmail(username);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // You should use the injected passwordEncoder, not create a new one.
        if (passwordEncoder.matches(password, employee.getPassword())) {
            final String token = jwtTokenUtil.generateToken(username, "EMPLOYEE");

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Employee login successful");
            response.put("token", token);
            response.put("employeeId", employee.getId());
            // Corrected to get company ID from the associated Company object
            if (employee.getCompany() != null) {
                response.put("companyId", employee.getCompany().getId());
            }

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}
