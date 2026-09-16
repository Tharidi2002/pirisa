package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.MissingPunchRequest;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.MissingPunchRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminMissingPunchService {

    private static final Logger logger = LoggerFactory.getLogger(AdminMissingPunchService.class);

    @Autowired
    private MissingPunchRequestRepository missingPunchRequestRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public List<MissingPunchRequest> getPendingRequestsByCompany(Long companyId) {
        return missingPunchRequestRepository.findByCompanyIdAndStatus(companyId, "PENDING");
    }

    @Transactional(readOnly = true)
    public List<MissingPunchRequest> getAllRequestsByCompany(Long companyId) {
        return missingPunchRequestRepository.findByCompanyId(companyId);
    }

    @Transactional
    public MissingPunchRequest approveRequest(Long requestId, Long approverId) {
        MissingPunchRequest request = missingPunchRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can be approved");
        }

        request.setStatus("APPROVED");
        request.setApprovedBy(approverId);
        request.setApprovedAt(LocalDateTime.now());
        missingPunchRequestRepository.save(request);

        // Update or create attendance record
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByEmpIdAndAttendanceDate(request.getEmployeeId(), request.getAttendanceDate());

        Attendance attendance;
        if (existingAttendance.isPresent()) {
            attendance = existingAttendance.get();
        } else {
            attendance = new Attendance();
            attendance.setEmpId(request.getEmployeeId());
            attendance.setAttendanceDate(request.getAttendanceDate());
            attendance.setAttendance_status("PRESENT");
            attendance.setWorking_status("OFFICE");
            attendance.setEntryType("MISSING_PUNCH_CORRECTION");
            attendance.setCreatedBy("HR (Approved #" + requestId + ")");
        }

        if (request.getRequestedStartedAt() != null) {
            attendance.setStartedAt(LocalDateTime.of(request.getAttendanceDate(), request.getRequestedStartedAt()));
        }
        if (request.getRequestedEndedAt() != null) {
            attendance.setEndedAt(LocalDateTime.of(request.getAttendanceDate(), request.getRequestedEndedAt()));
        }

        attendanceRepository.save(attendance);
        logger.info("Missing punch request {} approved by {}", requestId, approverId);

        return request;
    }

    @Transactional
    public MissingPunchRequest rejectRequest(Long requestId, Long approverId, String rejectionReason) {
        MissingPunchRequest request = missingPunchRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalArgumentException("Only pending requests can be rejected");
        }

        request.setStatus("REJECTED");
        request.setApprovedBy(approverId);
        request.setApprovedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);
        missingPunchRequestRepository.save(request);

        logger.info("Missing punch request {} rejected by {}", requestId, approverId);

        return request;
    }
}