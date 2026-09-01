package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Allowance;
import com.pirisa.hrm.model.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BonusRepository extends JpaRepository<Bonus, Long> {
    List<Bonus> findByCmpId(long cmpId);
}
