package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Allowance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllowanceRepository  extends JpaRepository<Allowance, Long> {
    List<Allowance> findByCmpId(long cmpId);
}
