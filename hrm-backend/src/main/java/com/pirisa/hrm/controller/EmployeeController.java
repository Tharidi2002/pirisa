package com.pirisa.hrm.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pirisa.hrm.dto.AttendanceEmployeeDTO;
import com.pirisa.hrm.dto.EmployeeCreationResult;
import com.pirisa.hrm.dto.EmpDetailsDTO;
import com.pirisa.hrm.dto.PayroleEmployeeDTO;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.service.EmailService;
import com.pirisa.hrm.service.EmployeeService;
import com.pirisa.hrm.service.PasswordResetService;
import com.pirisa.hrm.service.CompanyAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/employee")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;


    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private CompanyAccessService companyAccessService;



    @GetMapping(value = "/all", produces = {"application/json"})
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<Employee> employees = employeeService.getAllEmployees();

            Map<String, Object> employeeResponse = new HashMap<>();
            employeeResponse.put("resultCode", 100);
            employeeResponse.put("resultDesc", "Successfull");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("UserList", employees);
            responseBody.put("response", employeeResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }


    @PostMapping(value = "/add_employee", produces = {"application/json"})
    public ResponseEntity<?> addEmployee(@RequestBody Employee employee) {
        try {
            EmployeeCreationResult creationResult = employeeService.createEmployee(employee);
            Employee createdEmployee = creationResult.getEmployee();
            if (createdEmployee != null) {
                Map<String, Object> employeeResponse = new HashMap<>();
                employeeResponse.put("resultCode", 100);
                employeeResponse.put("resultDesc", creationResult.isEmailSent()
                        ? "Successfully Saved"
                        : "Employee saved successfully, but the welcome email could not be sent.");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Employee", createdEmployee);
                responseBody.put("response", employeeResponse);
                responseBody.put("emailSent", creationResult.isEmailSent());

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 101);
            errorResponse.put("resultDesc", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (DataIntegrityViolationException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 101);
            errorResponse.put("resultDesc",
                    "Employee details conflict with an existing record. Check the email address and employee/EPF numbers.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @GetMapping(value = "/emp/{id}", produces = {"application/json"})
    public ResponseEntity<Map<String, Object>> getEmployeeById(@PathVariable long id) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee != null) {
            Map<String, Object> employeeResponse = new HashMap<>();
            employeeResponse.put("resultCode", 100);
            employeeResponse.put("resultDesc", "Successful");
            employeeResponse.put("Employee_list", employee);
            return new ResponseEntity<>(employeeResponse, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/company/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getEmployeesByCompanyId(@PathVariable long cmpId) {
        try {
            List<Employee> employees = employeeService.getEmployeesByCompanyId(cmpId);
            if (employees.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No employees found for this company ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }

    @DeleteMapping("/{emp_id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long emp_id) {
        try {
            employeeService.deleteEmployee(emp_id);

            Map<String, Object> employeeResponse = new HashMap<>();
            employeeResponse.put("resultCode", 100);
            employeeResponse.put("resultDesc", "Successfully Deleted");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", emp_id);
            responseBody.put("response", employeeResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    /**
    * @deprecated Use GET /api/attendance/company/{companyId}. Removal date: 2026-10-21.
     */
    @Deprecated
    @GetMapping(value = "/attendanceList/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getAttendanceByCompanyId(
            @PathVariable long cmpId,
            Authentication authentication) {
        if (!companyAccessService.canAccessCompany(authentication.getName(), cmpId)) {
            return forbiddenCompanyAttendanceResponse();
        }
        try {
            List<AttendanceEmployeeDTO> employees = employeeService.getAttendanceByCompanyId(cmpId);
            if (employees.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No Attendance List found for this company ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }

    /**
    * @deprecated Use GET /api/attendance/company/{companyId}/latest. Removal date: 2026-10-21.
     */
    @Deprecated
    @GetMapping(value = "/lastattendanceList/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getLastAttendanceByCompanyId(
            @PathVariable long cmpId,
            Authentication authentication) {
        if (!companyAccessService.canAccessCompany(authentication.getName(), cmpId)) {
            return forbiddenCompanyAttendanceResponse();
        }
        try {
            List<AttendanceEmployeeDTO> employees = employeeService.getLastAttendanceByCompanyId(cmpId);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }


// Get payrole list by Company ID
    @GetMapping(value = "/payroleList/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getPayroleByCompanyId(@PathVariable long cmpId) {
        try {
            List<PayroleEmployeeDTO> employees = employeeService.getPayroleByCompanyId(cmpId);
            if (employees.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No Payrole List found for this company ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }

//Get payrole List By Employee ID

    @GetMapping(value = "/payroleListEmp/{empId}", produces = "application/json")
    public ResponseEntity<?> getPayroleByEmployeeId(@PathVariable long empId) {
        try {
            List<PayroleEmployeeDTO> employees = employeeService.getPayroleByEmployeeId(empId);
            if (employees.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No Payrole List found for this employee ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }


    @GetMapping(value = "/EmpDetailsList/{cmp_id}", produces = "application/json")
    public ResponseEntity<?> getEmpDetailsByCompanyId(
            @PathVariable long cmp_id,
            Authentication authentication) {
        if (!companyAccessService.canAccessCompany(authentication.getName(), cmp_id)) {
            return forbiddenCompanyAttendanceResponse();
        }
        try {
            List<EmpDetailsDTO> employees = employeeService.getEmpDetailsByCompanyId(cmp_id);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }


    @GetMapping(value = "/EmpDetailsListByEmp/{empId}", produces = "application/json")
    public ResponseEntity<?> getEmpDetailsByEmpId(@PathVariable long empId) {
        try {
            List<EmpDetailsDTO> employees = employeeService.getEmpDetailsByEmpId(empId);
            if (employees.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No Leave List found for this Employee ID"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeLeaveList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }





    //leave status = "PENDING" employees
    @GetMapping(value = "/PendingEmpDetailsList/{cmp_id}", produces = "application/json")
    public ResponseEntity<?> getPendingEmpDetailsByCompanyId(@PathVariable long cmp_id) {
        try {
            List<EmpDetailsDTO> employees = employeeService.getPendingEmpDetailsByCompanyId(cmp_id);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }



    //leave status = "APPROVED" employees
    @GetMapping(value = "/ApprovedEmpDetailsList/{cmp_id}", produces = "application/json")
    public ResponseEntity<?> getApprovedEmpDetailsByCompanyId(@PathVariable long cmp_id) {
        try {
            List<EmpDetailsDTO> employees = employeeService.getApprovedEmpDetailsByCompanyId(cmp_id);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }



    //leave status = "REJECTED" employees
    @GetMapping(value = "/RejectedEmpDetailsList/{cmp_id}", produces = "application/json")
    public ResponseEntity<?> getRejectedEmpDetailsByCompanyId(@PathVariable long cmp_id) {
        try {
            List<EmpDetailsDTO> employees = employeeService.getRejectedEmpDetailsByCompanyId(cmp_id);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", employees);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching employees"));
        }
    }



    // Get employee leave details by Company Id and Date
    @GetMapping(value = "/EmpApprovedLeavesByCmpAndDate/{cmpId}/{date}", produces = "application/json")
    public ResponseEntity<?> getApprovedEmpDetailsByCmpAndDate(
            @PathVariable("cmpId") long cmpId,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            // Retrieve employees with approved leave records matching the provided date
            List<EmpDetailsDTO> empDetailsList = employeeService.getApprovedEmpDetailsByCompanyIdAndDate(cmpId, date);

            if (empDetailsList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "No approved employee leave records found for this company on the provided date"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", empDetailsList);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Optionally log the error for debugging purposes
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching approved employee leave details"));
        }
    }





    @PutMapping(value = "/{emp_id}", produces = {"application/json"})
    public ResponseEntity<?> updateEmployee(@PathVariable Long emp_id, @RequestBody Employee updateEmployee) {

        Employee employee = employeeService.updateEmployee(emp_id, updateEmployee);
        if (employee != null) {
            Map<String, Object> employeeResponse = new HashMap<>();
            employeeResponse.put("resultCode", 100);
            employeeResponse.put("resultDesc", "Successfully Updated");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("Employee", employee);
            responseBody.put("response", employeeResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);

        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }



    /**
     * @deprecated Use GET /api/attendance/company/{companyId}/month/{month}. Removal date: 2026-10-21.
     */
    @Deprecated
    @GetMapping(value = "/attendanceList/{cmpId}/{month}", produces = "application/json")
    public ResponseEntity<?> getAttendanceByCompanyAndMonth(
            @PathVariable long cmpId,
            @PathVariable int month,
            Authentication authentication) {
        if (!companyAccessService.canAccessCompany(authentication.getName(), cmpId)) {
            return forbiddenCompanyAttendanceResponse();
        }
        try {
            List<AttendanceEmployeeDTO> list =
                    employeeService.getAttendanceByCompanyIdAndMonth(cmpId, month);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("EmployeeList", list);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap(
                            "error",
                            "An error occurred while fetching attendance"
                    ));
        }
    }

    private ResponseEntity<?> forbiddenCompanyAttendanceResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Collections.singletonMap("error", "You cannot access attendance data for another company."));
    }


    // change employee password.................................................

    @PutMapping(value = "/changePassword/{emp_id}", produces = {"application/json"})
    public ResponseEntity<?> changeEmployeePassword(@PathVariable Long emp_id,
                                                   @RequestBody Map<String, String> passwordChangeRequest) {
        String oldPassword = passwordChangeRequest.get("oldPassword");
        String newPassword = passwordChangeRequest.get("newPassword");

        if (oldPassword == null || oldPassword.trim().isEmpty() ||
                newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Collections.singletonMap("error", "Both old and new passwords must be provided"));
        }

        try {
            Employee updatedEmployee = employeeService.changeEmployeePassword(emp_id, oldPassword, newPassword);
            if (updatedEmployee == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Employee not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Password successfully updated");
            response.put("Company", updatedEmployee.getEmail());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while updating the password"));
        }
    }


    @PostMapping(value = "/forgetPassword", produces = "application/json")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        try {
            passwordResetService.resetPasswordForEmail(email);

            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Password reset successfully. Please check your email.");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (PasswordResetService.NotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", ex.getMessage()));
        } catch (PasswordResetService.DeliveryException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Collections.singletonMap("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while processing your request"));
        }
    }

    @GetMapping(value = "/next-numbers", produces = "application/json")
    public ResponseEntity<?> getNextEmployeeNumbers() {
        try {
            Map<String, String> numbers = employeeService.getNextEmployeeNumbers();
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("emp_no", numbers.get("emp_no"));
            response.put("epf_no", numbers.get("epf_no"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return handleException(e);
        }
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        e.printStackTrace(); // Log the exception for debugging purposes
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("resultCode", 101);
        errorResponse.put("resultDesc", "ERROR: " + e.getMessage());

        String jsonResponse;
        try {
            jsonResponse = new ObjectMapper().writeValueAsString(errorResponse);
        } catch (Exception ex) {
            jsonResponse = "{\"resultCode\":101,\"resultDesc\":\"ERROR\"}";
        }
        return new ResponseEntity<>(jsonResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
