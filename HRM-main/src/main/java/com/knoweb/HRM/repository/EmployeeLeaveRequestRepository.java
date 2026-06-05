package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.EmployeeLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmployeeLeaveRequestRepository extends JpaRepository<EmployeeLeave, Long> {

    @Query("SELECT el FROM EmployeeLeave el WHERE el.empId = :empId AND el.leaveStatus = 'approved'")
    List<EmployeeLeave> findApprovedByEmpId(@Param("empId") long empId);

    @Query("SELECT el FROM EmployeeLeave el WHERE el.empId = :empId AND el.leaveStatus = 'approved' AND el.leaveStartDay <= :asOfDateTime")
    List<EmployeeLeave> findApprovedByEmpIdAsOf(@Param("empId") long empId, @Param("asOfDateTime") LocalDateTime asOfDateTime);

    @Query("SELECT e FROM EmployeeLeave e WHERE e.leaveStatus = 'approved' AND :date BETWEEN e.leaveStartDay AND e.leaveEndDay")
    List<EmployeeLeave> findEmployeesOnLeaveForDate(@Param("date") LocalDateTime date);

    @Query("SELECT e FROM EmployeeLeave e WHERE e.empId = :employeeId AND e.leaveStatus = 'approved' AND :date BETWEEN e.leaveStartDay AND e.leaveEndDay")
    List<EmployeeLeave> findActiveLeaveForEmployee(@Param("employeeId") long employeeId, @Param("date") LocalDateTime date);
}
