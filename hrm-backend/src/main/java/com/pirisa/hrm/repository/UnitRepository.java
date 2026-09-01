package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Unit;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    @EntityGraph(attributePaths = {"designationList"})
    List<Unit> findByCmpId(long cmpId);
}
