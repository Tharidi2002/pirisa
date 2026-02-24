package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Documents;
import com.knoweb.HRM.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Documents, Long> {
    Optional<Documents> findByEmployee(Employee employee);
}
