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

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok("Login controller is working!");
    }

    @PostMapping("/company")
    public ResponseEntity<?> loginCompany(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            System.out.println("Login attempt for username: " + username);

            Company company = companyRepository.findByUsername(username);

            if (company == null) {
                System.out.println("Company not found for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }

            System.out.println("Company found: " + company.getCmpName());
            System.out.println("Stored password hash: " + company.getCmpPassword());
            System.out.println("Provided password: " + password);

            // Simple test response without password checking
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Company login successful");
            response.put("token", "test_token_" + System.currentTimeMillis());
            response.put("companyId", company.getId());
            response.put("debug", "Password check bypassed for testing");

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("Error in login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login error: " + e.getMessage());
        }
    }

    @PostMapping("/employee")
    public ResponseEntity<?> loginEmployee(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Employee employee = employeeRepository.findByUsername(username);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        // You should use the injected passwordEncoder, not create a new one.
        if (passwordEncoder.matches(password, employee.getPassword())) {
            final String token = jwtTokenUtil.generateToken(employee);

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
