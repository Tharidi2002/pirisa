package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmpId(long empId);

    Optional<Attendance> findByEmpIdAndAttendanceDate(long empId, LocalDate attendanceDate);

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    @Query("SELECT a FROM Attendance a, Employee e " +
            "WHERE a.empId = e.id " +
            "AND a.attendanceDate = :attendanceDate " +
            "AND e.dptId = :departmentId")
    List<Attendance> findByAttendanceDateAndDepartment(
            @Param("attendanceDate") LocalDate attendanceDate,
            @Param("departmentId") long departmentId);

    @Query("SELECT a FROM Attendance a, Employee e " +
            "WHERE a.empId = e.id " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "AND e.dptId = :departmentId " +
            "ORDER BY a.attendanceDate")
    List<Attendance> findByAttendanceDateBetweenAndDepartment(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("departmentId") long departmentId);

    @Query("SELECT a FROM Attendance a " +
            "WHERE a.empId = :empId " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "ORDER BY a.attendanceDate")
    List<Attendance> findByEmpIdAndDateRange(
            @Param("empId") long empId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Attendance a " +
            "WHERE a.empId = :empId " +
            "AND MONTH(a.startedAt) = :month")
    List<Attendance> findByEmpIdAndMonth(
            @Param("empId") long empId,
            @Param("month") int month);

}
