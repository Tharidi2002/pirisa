package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Department;
import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UnitRepository;
import com.pirisa.hrm.repository.DesignationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class DepartmentService {

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DesignationRepository designationRepository;

    public boolean departmentExists(Long id) {
        return unitRepository.existsById(id);
    }

    public long getEmployeeCountByDepartment(Long departmentId) {
        return employeeRepository.countByDepartmentId(departmentId);
    }

    public boolean hasDesignations(Long departmentId) {
        return designationRepository.countByDepartmentId(departmentId) > 0;
    }

    @Transactional
    public boolean deleteDepartment(Long id) {
        if (!unitRepository.existsById(id)) {
            return false;
        }
        
        // Check if department has employees
        long employeeCount = getEmployeeCountByDepartment(id);
        if (employeeCount > 0) {
            throw new RuntimeException("Cannot delete department with assigned employees");
        }
        
        // Check if department has designations
        boolean hasDesignations = hasDesignations(id);
        if (hasDesignations) {
            // Delete all designations first (cascade)
            designationRepository.deleteByDepartmentId(id);
        }
        
        unitRepository.deleteById(id);
        return true;
    }

    public List<Department> getAllDepartments() {
        List<Unit> units = unitRepository.findAll();
        return units.stream().map(unit -> {
            Department dept = new Department();
            dept.setId(unit.getId());
            dept.setDptName(unit.getDptName());
            dept.setDptCode(unit.getDptCode());
            dept.setDptDesc(unit.getDptDesc());
            return dept;
        }).collect(Collectors.toList());
    }

    public Department createDepartment(Department department) {
        Unit unit = new Unit();
        unit.setDptName(department.getDptName());
        unit.setDptCode(department.getDptCode());
        unit.setDptDesc(department.getDptDesc());
        unit = unitRepository.save(unit);
        department.setId(unit.getId());
        return department;
    }
}