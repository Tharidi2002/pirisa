package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.CompanyOTDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyOTDetailsRepository extends JpaRepository<CompanyOTDetails, Long> {
    CompanyOTDetails findByCmpId(long cmpId);

}
