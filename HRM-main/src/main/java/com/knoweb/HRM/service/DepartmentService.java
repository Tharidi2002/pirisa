package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Attendance;
import com.knoweb.HRM.model.Department;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.repository.AttendanceRepository;
import com.knoweb.HRM.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getDepartmentsByCompanyId(long companyId) {
        return departmentRepository.findByCompanyId(companyId);
    }

    public void deleteDepartment(Long dpt_id) {
        departmentRepository.deleteById(dpt_id);
    }
}
