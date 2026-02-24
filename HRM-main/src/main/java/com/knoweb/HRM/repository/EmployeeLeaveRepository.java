package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.EmployeeLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeLeaveRepository extends JpaRepository<EmployeeLeave, Long> {
    List<EmployeeLeave> findByEmployeeId(Long employeeId);
}
