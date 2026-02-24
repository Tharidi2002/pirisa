package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByCompanyId(long companyId);
    Employee findByEmail(String email);
    Employee findByUsername(String username);
}
