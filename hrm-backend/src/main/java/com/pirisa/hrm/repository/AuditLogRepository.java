package com.pirisa.hrm.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pirisa.hrm.model.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<AuditLog> findByPerformedBy(Long userId);
    List<AuditLog> findByEntityTypeAndAction(String entityType, String action);
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
