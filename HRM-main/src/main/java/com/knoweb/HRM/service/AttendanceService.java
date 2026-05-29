package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Attendance;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.repository.AttendanceRepository;
import com.knoweb.HRM.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public Attendance createAttendance(Attendance attendance) {
        validateAttendanceJoinDate(attendance);
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

    public List<Attendance> getAttendanceByEmpIdAndDateRange(long empId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmpIdAndDateRange(empId, startDate, endDate);
    }

    public List<Attendance> markBulkAttendance(List<Attendance> attendances) {
        if (attendances == null || attendances.isEmpty()) {
            throw new IllegalArgumentException("Attendance list cannot be empty");
        }

        Map<String, Attendance> uniqueAttendanceByKey = new HashMap<>();
        for (Attendance attendance : attendances) {
            if (attendance.getAttendanceDate() == null) {
                throw new IllegalArgumentException("Each attendance record must include attendanceDate");
            }
            if (attendance.getEmpId() <= 0) {
                throw new IllegalArgumentException("Each attendance record must include a valid empId");
            }
            validateAttendanceJoinDate(attendance);
            String key = attendance.getEmpId() + "|" + attendance.getAttendanceDate();
            uniqueAttendanceByKey.put(key, attendance);
        }

        List<Attendance> recordsToSave = new ArrayList<>();
        for (Attendance attendance : uniqueAttendanceByKey.values()) {
            Optional<Attendance> existingAttendance = attendanceRepository.findByEmpIdAndAttendanceDate(
                    attendance.getEmpId(), attendance.getAttendanceDate());

            Attendance persistedAttendance = existingAttendance.orElseGet(Attendance::new);
            persistedAttendance.setAttendanceDate(attendance.getAttendanceDate());
            persistedAttendance.setEmpId(attendance.getEmpId());
            persistedAttendance.setStartedAt(attendance.getStartedAt());
            persistedAttendance.setEndedAt(attendance.getEndedAt());
            persistedAttendance.setWorking_status(attendance.getWorking_status());
            persistedAttendance.setAttendance_status(attendance.getAttendance_status());
            persistedAttendance.setEntryType(Optional.ofNullable(attendance.getEntryType()).orElse("MANUAL_HR"));
            persistedAttendance.setCreatedBy(Optional.ofNullable(attendance.getCreatedBy()).orElse("SYSTEM"));
            persistedAttendance.setDayName(attendance.getDayName());

            recordsToSave.add(persistedAttendance);
        }

        return attendanceRepository.saveAll(recordsToSave);
    }

    /**
     * Validate the attendance entry against the employee's join date.
     * Business rule: attendance cannot be marked before the employee joined.
     */
    private void validateAttendanceJoinDate(Attendance attendance) {
        if (attendance == null) {
            throw new IllegalArgumentException("Attendance entry cannot be null");
        }

        if (attendance.getAttendanceDate() == null) {
            throw new IllegalArgumentException("Attendance date is required");
        }

        if (attendance.getEmpId() <= 0) {
            throw new IllegalArgumentException("Attendance must reference a valid employee ID");
        }

        Employee employee = employeeRepository.findById(attendance.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("Cannot validate attendance: employee not found."));

        LocalDate joinDate = parseEmployeeJoinDate(employee.getDate_of_joining());
        if (joinDate == null) {
            throw new IllegalArgumentException("Cannot validate attendance: employee join date is missing or invalid.");
        }

        if (attendance.getAttendanceDate().isBefore(joinDate)) {
            throw new IllegalArgumentException("Cannot mark attendance prior to the employee's join date.");
        }
    }

    private LocalDate parseEmployeeJoinDate(String dateOfJoining) {
        if (dateOfJoining == null || dateOfJoining.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(dateOfJoining, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateOfJoining);
            } catch (DateTimeParseException ex) {
                try {
                    return LocalDate.parse(dateOfJoining, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } catch (DateTimeParseException ignored) {
                    return null;
                }
            }
        }
    }

    public byte[] exportAttendanceToExcel(String filterType, Long departmentId, Long empId,
                                          LocalDate startDate, LocalDate endDate) throws IOException {
        List<Attendance> attendanceList = findAttendanceByFilters(filterType, departmentId, empId, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance");
            CreationHelper creationHelper = workbook.getCreationHelper();

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(creationHelper.createDataFormat().getFormat("yyyy-mm-dd"));

            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Attendance ID", "Employee ID", "Attendance Date", "Start Time", "End Time",
                    "Status", "Working Status", "Entry Type", "Created By", "Day Name", "Total Time (mins)"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (Attendance attendance : attendanceList) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(attendance.getId());
                row.createCell(1).setCellValue(attendance.getEmpId());

                Cell dateCell = row.createCell(2);
                if (attendance.getAttendanceDate() != null) {
                    dateCell.setCellValue(java.sql.Date.valueOf(attendance.getAttendanceDate()));
                    dateCell.setCellStyle(dateStyle);
                }

                row.createCell(3).setCellValue(formatLocalDateTime(attendance.getStartedAt()));
                row.createCell(4).setCellValue(formatLocalDateTime(attendance.getEndedAt()));
                row.createCell(5).setCellValue(Optional.ofNullable(attendance.getAttendance_status()).orElse(""));
                row.createCell(6).setCellValue(Optional.ofNullable(attendance.getWorking_status()).orElse(""));
                row.createCell(7).setCellValue(Optional.ofNullable(attendance.getEntryType()).orElse(""));
                row.createCell(8).setCellValue(Optional.ofNullable(attendance.getCreatedBy()).orElse(""));
                row.createCell(9).setCellValue(Optional.ofNullable(attendance.getDayName()).orElse(""));
                row.createCell(10).setCellValue(attendance.getTotalTime());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public List<Attendance> importAttendanceFromExcel(MultipartFile file, String createdBy) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded Excel file must not be empty");
        }

        List<Attendance> attendanceRecords = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new IllegalArgumentException("Excel file does not contain any sheets");
            }

            Iterator<Row> rowIterator = sheet.rowIterator();
            if (!rowIterator.hasNext()) {
                throw new IllegalArgumentException("Excel file does not contain a header row");
            }

            Row headerRow = rowIterator.next();
            Map<String, Integer> headerIndex = getHeaderIndex(headerRow);

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (row == null) {
                    continue;
                }
                Attendance attendance = parseRowToAttendance(row, headerIndex, createdBy);
                if (attendance != null) {
                    attendanceRecords.add(attendance);
                }
            }
        }

        return markBulkAttendance(attendanceRecords);
    }

    private Attendance parseRowToAttendance(Row row, Map<String, Integer> headerIndex, String createdBy) {
        String empIdText = getCellValue(row.getCell(headerIndex.getOrDefault("EMPLOYEE ID", -1)));
        if (empIdText == null || empIdText.isBlank()) {
            return null;
        }

        long empId = Long.parseLong(empIdText.trim());
        LocalDate attendanceDate = parseDateCell(row.getCell(headerIndex.getOrDefault("ATTENDANCE DATE", -1)));
        if (attendanceDate == null) {
            throw new IllegalArgumentException("Attendance Date is required for row " + row.getRowNum());
        }

        Attendance attendance = new Attendance();
        attendance.setEmpId(empId);
        attendance.setAttendanceDate(attendanceDate);
        attendance.setStartedAt(parseDateTimeCell(row.getCell(headerIndex.getOrDefault("START TIME", -1)), attendanceDate));
        attendance.setEndedAt(parseDateTimeCell(row.getCell(headerIndex.getOrDefault("END TIME", -1)), attendanceDate));
        attendance.setAttendance_status(getCellValue(row.getCell(headerIndex.getOrDefault("ATTENDANCE STATUS", -1))));
        attendance.setWorking_status(getCellValue(row.getCell(headerIndex.getOrDefault("WORKING STATUS", -1))));
        attendance.setEntryType(Optional.ofNullable(getCellValue(row.getCell(headerIndex.getOrDefault("ENTRY TYPE", -1)))).orElse("EXCEL_IMPORT"));
        attendance.setCreatedBy(Optional.ofNullable(createdBy).orElse("EXCEL_IMPORT"));
        attendance.setDayName(Optional.ofNullable(getCellValue(row.getCell(headerIndex.getOrDefault("DAY NAME", -1)))).orElse(null));

        return attendance;
    }

    private Map<String, Integer> getHeaderIndex(Row headerRow) {
        Map<String, Integer> headerIndex = new HashMap<>();
        for (Cell cell : headerRow) {
            String headerValue = Optional.ofNullable(cell.getStringCellValue())
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .orElse("");
            headerIndex.put(headerValue, cell.getColumnIndex());
        }
        return headerIndex;
    }

    private LocalDate parseDateCell(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                String dateText = cell.getStringCellValue().trim();
                if (dateText.isEmpty()) {
                    return null;
                }
                return LocalDate.parse(dateText, DATE_FORMATTER);
            case NUMERIC:
                return cell.getLocalDateTimeCellValue().toLocalDate();
            default:
                return null;
        }
    }

    private LocalDateTime parseDateTimeCell(Cell cell, LocalDate attendanceDate) {
        if (cell == null || attendanceDate == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                String value = cell.getStringCellValue().trim();
                if (value.isEmpty()) {
                    return null;
                }
                if (value.contains(" ")) {
                    return LocalDateTime.parse(value, DATE_TIME_FORMATTER);
                }
                return LocalDateTime.of(attendanceDate, LocalTime.parse(value, TIME_FORMATTER));
            case NUMERIC:
                return cell.getLocalDateTimeCellValue();
            default:
                return null;
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue()).trim();
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue()).trim();
            case FORMULA:
                return Optional.ofNullable(cell.getCellFormula()).orElse("").trim();
            default:
                return null;
        }
    }

    private String formatLocalDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : dateTime.format(DATE_TIME_FORMATTER);
    }

    private List<Attendance> findAttendanceByFilters(String filterType, Long departmentId, Long empId,
                                                     LocalDate startDate, LocalDate endDate) {
        if (empId != null && startDate != null && endDate != null) {
            return attendanceRepository.findByEmpIdAndDateRange(empId, startDate, endDate);
        }

        if (departmentId != null && startDate != null && endDate != null) {
            return attendanceRepository.findByAttendanceDateBetweenAndDepartment(startDate, endDate, departmentId);
        }

        if (departmentId != null && startDate != null && endDate == null) {
            return attendanceRepository.findByAttendanceDateAndDepartment(startDate, departmentId);
        }

        if (startDate != null && endDate == null) {
            return attendanceRepository.findByAttendanceDate(startDate);
        }

        return attendanceRepository.findAll();
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

    public Attendance getAttendanceById(long id) {
        return attendanceRepository.findById(id).orElse(null);
    }

    public List<Attendance> getAttendanceByEmployeeIdAndMonth(long empId, int month) {
        return attendanceRepository.findByEmpIdAndMonth(empId, month);
    }
}
