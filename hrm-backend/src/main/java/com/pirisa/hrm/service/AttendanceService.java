package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.BulkAttendanceDataDTO;
import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceValidator attendanceValidator;

    @Autowired
    private AttendanceReportService attendanceReportService;

    @Autowired
    private AttendanceImportExportService attendanceImportExportService;

    public Attendance createAttendance(Attendance attendance) {
        attendanceValidator.validateAttendanceJoinDate(attendance, employeeRepository);
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByEmployeeId(long empId) {
        return attendanceRepository.findByEmpId(empId);
    }

    public List<Attendance> getAttendanceByAttendanceDate(LocalDate attendanceDate) {
        return attendanceRepository.findByAttendanceDate(attendanceDate);
    }

    public List<Attendance> getAttendanceByDateAndDepartment(LocalDate attendanceDate, long departmentId) {
        return attendanceRepository.findByAttendanceDateAndDepartment(attendanceDate, departmentId);
    }

    public BulkAttendanceDataDTO getBulkAttendanceData(LocalDate attendanceDate, long companyId, Long departmentId) {
        return attendanceReportService.getBulkAttendanceData(attendanceDate, companyId, departmentId);
    }

    public List<Attendance> markBulkAttendance(List<Attendance> attendanceList) {
        if (attendanceList == null || attendanceList.isEmpty()) {
            throw new IllegalArgumentException("Attendance list cannot be empty");
        }

        List<Attendance> validatedList = new ArrayList<>();
        for (Attendance attendance : attendanceList) {
            if (attendance == null) {
                continue;
            }

            String normalizedReason = normalizeText(attendance.getReason(), attendance.getDepartureReason());
            String normalizedNotes = normalizeText(attendance.getNotes(), attendance.getDepartureNotes());
            attendance.setDepartureReason(normalizedReason);
            attendance.setDepartureNotes(normalizedNotes);

            if (attendance.getEntryType() == null || attendance.getEntryType().isBlank()) {
                attendance.setEntryType("MANUAL_HR");
            }
            if (attendance.getCreatedBy() == null || attendance.getCreatedBy().isBlank()) {
                attendance.setCreatedBy("HR Admin");
            }

            attendanceValidator.validateAttendanceJoinDate(attendance, employeeRepository);

            if ("ABSENT".equalsIgnoreCase(attendance.getAttendance_status())) {
                attendance.setStartedAt(null);
                attendance.setEndedAt(null);
                attendance.setHalfDayType(null);
            } else if ("MANUAL_HR".equalsIgnoreCase(attendance.getEntryType())
                    && attendance.getStartedAt() == null) {
                attendance.setStartedAt(currentAttendanceTime(attendance));
            }

            validatedList.add(attendance);
        }

        if (validatedList.isEmpty()) {
            throw new IllegalArgumentException("No valid attendance records were provided");
        }

        List<Attendance> recordsToSave = new ArrayList<>();
        for (Attendance incoming : validatedList) {
            Optional<Attendance> existing = attendanceRepository
                    .findByEmpIdAndAttendanceDate(incoming.getEmpId(), incoming.getAttendanceDate());

            if (existing.isPresent()) {
                Attendance current = existing.get();
                current.setStartedAt(incoming.getStartedAt());
                current.setEndedAt(incoming.getEndedAt());
                current.setWorking_status(incoming.getWorking_status());
                current.setAttendance_status(incoming.getAttendance_status());
                current.setHalfDayType(incoming.getHalfDayType());
                current.setEntryType(incoming.getEntryType());
                current.setCreatedBy(incoming.getCreatedBy());
                current.setDepartureReason(incoming.getDepartureReason());
                current.setDepartureNotes(incoming.getDepartureNotes());
                recordsToSave.add(current);
            } else {
                recordsToSave.add(incoming);
            }
        }

        return attendanceRepository.saveAll(recordsToSave);
    }

    public byte[] exportAttendanceToExcel(long companyId, Long departmentId, Long empId,
                                          LocalDate startDate, LocalDate endDate) throws IOException {
        return attendanceImportExportService.exportAttendanceToExcel(companyId, departmentId, empId, startDate, endDate);
    }

    public List<Attendance> importAttendanceFromExcel(MultipartFile file, String createdBy) throws IOException {
        List<Attendance> attendanceRecords = attendanceImportExportService.importAttendanceFromExcel(file, createdBy);
        return markBulkAttendance(attendanceRecords);
    }

    public Attendance updateAttendanceStatus(long attendanceId, String status, String halfDayType) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found for id: " + attendanceId));
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (!List.of("OFFICE", "WFH", "HALF_DAY", "ABSENT").contains(normalizedStatus)) {
            throw new IllegalArgumentException("Status must be OFFICE, WFH, HALF_DAY, or ABSENT.");
        }

        if ("HALF_DAY".equals(normalizedStatus)) {
            String normalizedHalfDayType = halfDayType == null ? "" : halfDayType.trim().toUpperCase();
            if (!List.of("MORNING", "AFTERNOON").contains(normalizedHalfDayType)) {
                throw new IllegalArgumentException("Half-day type must be MORNING or AFTERNOON.");
            }
            attendance.setHalfDayType(normalizedHalfDayType);
            attendance.setAttendance_status("HALF_DAY");
            attendance.setWorking_status("OFFICE");
            if (attendance.getStartedAt() == null) {
                attendance.setStartedAt(currentAttendanceTime(attendance));
            }
        } else {
            attendance.setHalfDayType(null);
            attendance.setAttendance_status("ABSENT".equals(normalizedStatus) ? "ABSENT" : "PRESENT");
            attendance.setWorking_status("ABSENT".equals(normalizedStatus) ? "OFFICE" : normalizedStatus);
            if ("ABSENT".equals(normalizedStatus)) {
                attendance.setStartedAt(null);
                attendance.setEndedAt(null);
            } else if (attendance.getStartedAt() == null) {
                attendance.setStartedAt(currentAttendanceTime(attendance));
            }
        }
        return attendanceRepository.save(attendance);
    }

    public Attendance updateAttendance(Long atdnc_id, Attendance updateAttendance) {
        Attendance attendance = getAttendanceById(atdnc_id);
        if (attendance != null) {
            attendance.setEndedAt(updateAttendance.getEndedAt());
            attendance.setStartedAt(updateAttendance.getStartedAt());
            attendance.setAttendanceDate(updateAttendance.getAttendanceDate());
            attendance.setAttendance_status(updateAttendance.getAttendance_status());
            attendance.setWorking_status(updateAttendance.getWorking_status());
            attendance.setEntryType(Optional.ofNullable(updateAttendance.getEntryType()).orElse(attendance.getEntryType()));
            attendance.setCreatedBy(Optional.ofNullable(updateAttendance.getCreatedBy()).orElse(attendance.getCreatedBy()));
            return attendanceRepository.save(attendance);
        }
        return null;
    }

    public Attendance clockOutAttendance(long attendanceId, String endedAtText, String departureReason, String departureNotes) {
        Attendance attendance = getAttendanceById(attendanceId);
        if (attendance == null) {
            throw new IllegalArgumentException("Attendance record not found for id: " + attendanceId);
        }
        if ("ABSENT".equalsIgnoreCase(attendance.getAttendance_status())) {
            throw new IllegalArgumentException("Cannot set an off-time for an absent employee.");
        }

        LocalDateTime parsedEndedAt = null;
        if (endedAtText != null && !endedAtText.isBlank()) {
            String trimmed = endedAtText.trim();
            try {
                if (trimmed.contains("T")) {
                    parsedEndedAt = LocalDateTime.parse(trimmed);
                } else {
                    String timeStr = trimmed.length() > 5 ? trimmed.substring(0, 5) : trimmed;
                    LocalTime time = LocalTime.parse(timeStr, java.time.format.DateTimeFormatter.ofPattern("HH:mm"));
                    parsedEndedAt = LocalDateTime.of(attendance.getAttendanceDate() != null ? attendance.getAttendanceDate() : LocalDate.now(), time);
                }
            } catch (Exception ex) {
                throw new IllegalArgumentException("Unable to parse endedAt value: " + endedAtText + ". Use HH:mm format.");
            }
        }

        if (parsedEndedAt != null) {
            attendance.setEndedAt(parsedEndedAt);
        }
        attendance.setDepartureReason(departureReason);
        attendance.setDepartureNotes(departureNotes);

        return attendanceRepository.save(attendance);
    }

    public Attendance getAttendanceById(long id) {
        return attendanceRepository.findById(id).orElse(null);
    }

    private String normalizeText(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return null;
    }

    private LocalDateTime currentAttendanceTime(Attendance attendance) {
        LocalDate attendanceDate = Optional.ofNullable(attendance.getAttendanceDate())
                .orElse(LocalDate.now());
        return attendanceDate.atTime(LocalTime.now());
    }
}
