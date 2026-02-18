package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.CompanyLogoes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyLogoRepository extends JpaRepository<CompanyLogoes, Long> {
    Optional<CompanyLogoes> findByCmpId(Long cmpId);
}
