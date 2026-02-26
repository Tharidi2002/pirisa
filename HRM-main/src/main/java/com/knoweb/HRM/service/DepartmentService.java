package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Department;
import com.knoweb.HRM.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getDepartmentsByCompanyId(long cmpId) {
        return departmentRepository.findByCmpId(cmpId);
    }

    public Department updateDepartment(Department department) {
        Optional<Department> existingDept = departmentRepository.findById(department.getId());
        if (existingDept.isPresent()) {
            Department dept = existingDept.get();
            dept.setDpt_name(department.getDpt_name());
            dept.setDpt_code(department.getDpt_code());
            dept.setDpt_desc(department.getDpt_desc());
            return departmentRepository.save(dept);
        }
        return null;
    }

    public void deleteDepartment(Long dpt_id) {
        try {
            if (!departmentRepository.existsById(dpt_id)) {
                throw new RuntimeException("Department not found with id: " + dpt_id);
            }
            departmentRepository.deleteById(dpt_id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete department: " + e.getMessage(), e);
        }
    }

    public List<Department> searchDepartments(long cmpId, String query) {
        List<Department> allDepts = departmentRepository.findByCmpId(cmpId);
        String lowercaseQuery = query.toLowerCase();
        
        return allDepts.stream()
                .filter(dept -> 
                    dept.getDpt_name().toLowerCase().contains(lowercaseQuery) ||
                    dept.getDpt_code().toLowerCase().contains(lowercaseQuery) ||
                    (dept.getDpt_desc() != null && dept.getDpt_desc().toLowerCase().contains(lowercaseQuery))
                )
                .collect(java.util.stream.Collectors.toList());
    }
}
