package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.Payrole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayroleRepository extends JpaRepository<Payrole, Long> {
    List<Payrole> findEmployeeById(long empId);
}
