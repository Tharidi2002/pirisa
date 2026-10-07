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

    public void deleteAttendance(Long atdnc_id) {
        attendanceRepository.deleteById(atdnc_id);
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
}
