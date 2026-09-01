package com.pirisa.hrm.controller;

import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.model.Department;
import com.pirisa.hrm.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/department")
@CrossOrigin(origins = "http://localhost:5174")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping("/all")
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Department> addDepartment(@RequestBody Department department) {
        Department newDepartment = departmentService.createDepartment(department);
        return new ResponseEntity<>(newDepartment, HttpStatus.CREATED);
    }

    // Delete department with employee check
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteDepartment(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if department exists
            if (!departmentService.departmentExists(id)) {
                response.put("resultCode", 404);
                response.put("resultDesc", "Department not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Check if department has employees
            long employeeCount = departmentService.getEmployeeCountByDepartment(id);
            
            if (employeeCount > 0) {
                response.put("resultCode", 400);
                response.put("resultDesc", String.format(
                    "Cannot delete department because it has %d employee(s) assigned to it. Please reassign or delete the employees first.", 
                    employeeCount
                ));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Check if department has designations
            boolean hasDesignations = departmentService.hasDesignations(id);
            if (hasDesignations) {
                departmentService.deleteDepartment(id);
                response.put("resultCode", 100);
                response.put("resultDesc", "Department deleted successfully");
                return ResponseEntity.ok(response);
            }
            
            boolean deleted = departmentService.deleteDepartment(id);
            
            if (deleted) {
                response.put("resultCode", 100);
                response.put("resultDesc", "Department deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("resultCode", 500);
                response.put("resultDesc", "Failed to delete department");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            response.put("resultCode", 500);
            response.put("resultDesc", "Failed to delete department: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get employee count for a department
    @GetMapping("/{id}/employee-count")
    public ResponseEntity<Map<String, Object>> getEmployeeCountByDepartment(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            long count = departmentService.getEmployeeCountByDepartment(id);
            response.put("count", count);
            response.put("resultCode", 100);
            response.put("resultDesc", "Employee count retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("resultCode", 500);
            response.put("resultDesc", "Failed to get employee count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}