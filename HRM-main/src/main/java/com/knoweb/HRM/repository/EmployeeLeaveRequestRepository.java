package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.EmployeeLeave;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeLeaveRequestRepository extends JpaRepository<EmployeeLeave, Long> {
}
