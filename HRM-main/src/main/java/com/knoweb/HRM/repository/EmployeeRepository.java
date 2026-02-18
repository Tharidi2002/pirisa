package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByCmpId(long cmpId);


    List<Employee> findEmployeeById(long empId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Employee e WHERE e.id = :emp_id")
    void deleteEmployee(long emp_id);

    long countByCmpId(long cmpId);

  //  Employee findByEmail(String email);

    Employee findByUsername(String username);

    Employee findByEmail(String email);
}
