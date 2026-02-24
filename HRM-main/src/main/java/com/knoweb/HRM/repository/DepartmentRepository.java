package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByCompanyId(long companyId);
}
