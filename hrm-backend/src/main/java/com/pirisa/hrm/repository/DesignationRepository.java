package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {

    List<Designation> findByDptId(Long departmentId);

    @Query("SELECT COUNT(d) FROM Designation d WHERE d.dptId = :departmentId")
    long countByDepartmentId(@Param("departmentId") Long departmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Designation d WHERE d.dptId = :departmentId")
    void deleteByDepartmentId(@Param("departmentId") Long departmentId);
}