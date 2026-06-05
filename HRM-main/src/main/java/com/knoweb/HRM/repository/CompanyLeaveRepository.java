package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.CompanyLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyLeaveRepository extends JpaRepository<CompanyLeave, Long> {
    List<CompanyLeave> findByCmpId(long cmpId);
}
