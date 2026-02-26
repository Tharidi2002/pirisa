package com.knoweb.HRM.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.HRM.model.Department;
import com.knoweb.HRM.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/department")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;


    @PostMapping(value = "/add_department", produces = {"application/json"})
    public ResponseEntity<?> addDepartment(@RequestBody Department department) {
        try {
            // Check for duplicate department code or name within the same company
            List<Department> existingDepts = departmentService.getDepartmentsByCompanyId(department.getCmpId());
            boolean duplicate = existingDepts.stream().anyMatch(dept -> 
                dept.getDpt_code().equals(department.getDpt_code()) || 
                dept.getDpt_name().equalsIgnoreCase(department.getDpt_name())
            );
            
            if (duplicate) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Department code or name already exists");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            Department createdDepartment = departmentService.createDepartment(department);
            if (createdDepartment != null) {
                Map<String, Object> departmentResponse = new HashMap<>();
                departmentResponse.put("resultCode", 100);
                departmentResponse.put("resultDesc", "Successfully Saved");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Add_Att", createdDepartment);
                responseBody.put("response", departmentResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @GetMapping(value = "/company/{cmpId}", produces = "application/json")
    public ResponseEntity<?> getDepartmentsByCompanyId(@PathVariable long cmpId) {
        try {
            List<Department> departments = departmentService.getDepartmentsByCompanyId(cmpId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("DepartmentList", departments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while fetching departments"));
        }
    }

    @GetMapping(value = "/search/{cmpId}", produces = "application/json")
    public ResponseEntity<?> searchDepartments(@PathVariable long cmpId, @RequestParam String query) {
        try {
            List<Department> departments = departmentService.searchDepartments(cmpId, query);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Successful");
            response.put("DepartmentList", departments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An error occurred while searching departments"));
        }
    }

    @PutMapping(value = "/update_department", produces = {"application/json"})
    public ResponseEntity<?> updateDepartment(@RequestBody Department department) {
        try {
            // Check for duplicate department code or name (excluding current department)
            List<Department> existingDepts = departmentService.getDepartmentsByCompanyId(department.getCmpId());
            boolean duplicate = existingDepts.stream().anyMatch(dept -> 
                dept.getId() != department.getId() && (
                    dept.getDpt_code().equals(department.getDpt_code()) || 
                    dept.getDpt_name().equalsIgnoreCase(department.getDpt_name())
                )
            );
            
            if (duplicate) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Department code or name already exists");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            Department updatedDepartment = departmentService.updateDepartment(department);
            if (updatedDepartment != null) {
                Map<String, Object> departmentResponse = new HashMap<>();
                departmentResponse.put("resultCode", 100);
                departmentResponse.put("resultDesc", "Successfully Updated");

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("Department", updatedDepartment);
                responseBody.put("response", departmentResponse);

                return new ResponseEntity<>(responseBody, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return handleException(e);
        }
    }


    @DeleteMapping("/{dpt_id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long dpt_id) {
        try {
            departmentService.deleteDepartment(dpt_id);

            Map<String, Object> departmentResponse = new HashMap<>();
            departmentResponse.put("resultCode", 100);
            departmentResponse.put("resultDesc", "Successfully Deleted");

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("id", dpt_id);
            responseBody.put("response", departmentResponse);

            return new ResponseEntity<>(responseBody, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 101);
            errorResponse.put("resultDesc", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return handleException(e);
        }
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("resultCode", 101);
        errorResponse.put("resultDesc", "ERROR");

        String jsonResponse;
        try {
            jsonResponse = new ObjectMapper().writeValueAsString(errorResponse);
        } catch (Exception ex) {
            jsonResponse = "{\"resultCode\":101,\"resultDesc\":\"ERROR\"}";
        }
        return new ResponseEntity<>(jsonResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
