package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.MissingPunchRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissingPunchRequestRepository extends JpaRepository<MissingPunchRequest, Long> {

    List<MissingPunchRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<MissingPunchRequest> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT m FROM MissingPunchRequest m WHERE m.employeeId IN " +
           "(SELECT e.id FROM Employee e WHERE e.cmpId = :companyId) " +
           "AND m.status = :status ORDER BY m.createdAt DESC")
    List<MissingPunchRequest> findByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") String status);

    @Query("SELECT m FROM MissingPunchRequest m WHERE m.employeeId IN " +
           "(SELECT e.id FROM Employee e WHERE e.cmpId = :companyId) " +
           "ORDER BY m.createdAt DESC")
    List<MissingPunchRequest> findByCompanyId(@Param("companyId") Long companyId);
}