package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Documents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Documents, Long> {
    Optional<Object> findByEmpId(Long empId);

    Optional<Documents> findByempId(long empId);
}
