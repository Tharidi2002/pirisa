package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.*;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AttendanceImportExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceValidator attendanceValidator;

    public byte[] exportAttendanceToExcel(long companyId, Long departmentId, Long empId,
                                          LocalDate startDate, LocalDate endDate) throws IOException {
        List<Attendance> attendanceList = attendanceRepository.findForCompanyReport(
                companyId, departmentId, empId, startDate, endDate);

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
                    "Attendance ID", "Employee ID", "EPF No", "Employee Name", "Attendance Date", "Start Time", "End Time",
                    "Status", "Working Status", "Notes", "Entry Type", "Created By", "Total Time (mins)"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (Attendance attendance : attendanceList) {
                Row row = sheet.createRow(rowIndex++);
                Employee employee = employeeRepository.findById(attendance.getEmpId()).orElse(null);

                row.createCell(0).setCellValue(attendance.getId());
                row.createCell(1).setCellValue(attendance.getEmpId());
                row.createCell(2).setCellValue(employee != null ? employee.getEpfNo() : "");
                row.createCell(3).setCellValue(employee != null ? employee.getFirstName() + " " + employee.getLastName() : "");

                Cell dateCell = row.createCell(4);
                if (attendance.getAttendanceDate() != null) {
                    dateCell.setCellValue(java.sql.Date.valueOf(attendance.getAttendanceDate()));
                    dateCell.setCellStyle(dateStyle);
                }

                row.createCell(5).setCellValue(formatLocalDateTime(attendance.getStartedAt()));
                row.createCell(6).setCellValue(formatLocalDateTime(attendance.getEndedAt()));
                row.createCell(7).setCellValue(Optional.ofNullable(attendance.getAttendance_status()).orElse(""));
                row.createCell(8).setCellValue(Optional.ofNullable(attendance.getWorking_status()).orElse(""));
                row.createCell(9).setCellValue(Optional.ofNullable(attendance.getDepartureNotes()).orElse(""));
                row.createCell(10).setCellValue(Optional.ofNullable(attendance.getEntryType()).orElse(""));
                row.createCell(11).setCellValue(Optional.ofNullable(attendance.getCreatedBy()).orElse(""));
                row.createCell(12).setCellValue(attendance.getTotalTime());
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

        return attendanceRecords;
    }

    private Map<String, Integer> getHeaderIndex(Row headerRow) {
        Map<String, Integer> headerIndex = new HashMap<>();
        Map<String, String> headerAliases = new HashMap<>();
        headerAliases.put("EPF NO", "EPF_NO");
        headerAliases.put("EMPLOYEE ID", "EPF_NO");
        headerAliases.put("ATTENDANCE DATE", "ATTENDANCE_DATE");
        headerAliases.put("DATE", "ATTENDANCE_DATE");
        headerAliases.put("STATUS", "STATUS");
        headerAliases.put("ATTENDANCE STATUS", "STATUS");
        headerAliases.put("START TIME", "START_TIME");
        headerAliases.put("CLOCK IN", "START_TIME");
        headerAliases.put("END TIME", "END_TIME");
        headerAliases.put("CLOCK OUT", "END_TIME");
        headerAliases.put("WORKING MODE", "WORKING_MODE");
        headerAliases.put("MODE", "WORKING_MODE");
        headerAliases.put("NOTES", "NOTES");
        headerAliases.put("REASON", "NOTES");
        headerAliases.put("WORK LOG", "NOTES");

        for (Cell cell : headerRow) {
            String headerValue = Optional.ofNullable(cell.getStringCellValue())
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .orElse("");
            String standardHeader = headerAliases.getOrDefault(headerValue, headerValue);
            headerIndex.put(standardHeader, cell.getColumnIndex());
        }
        return headerIndex;
    }

    private Attendance parseRowToAttendance(Row row, Map<String, Integer> headerIndex, String createdBy) {
        String epfNo = getCellValue(getCell(row, headerIndex, "EPF_NO"));
        if (epfNo == null || epfNo.isBlank()) {
            return null;
        }

        Employee employee = employeeRepository.findByEpfNo(epfNo.trim())
                .orElseThrow(() -> new IllegalArgumentException("Row " + (row.getRowNum() + 1) + ": Employee not found for EPF No '" + epfNo + "'"));

        LocalDate attendanceDate = parseDateCell(getCell(row, headerIndex, "ATTENDANCE_DATE"));
        if (attendanceDate == null) {
            throw new IllegalArgumentException("Row " + (row.getRowNum() + 1) + ": Attendance Date is required for EPF No " + epfNo);
        }

        LocalDate joinDate = attendanceValidator.parseEmployeeJoinDate(employee.getDateOfJoining());
        if (joinDate != null && attendanceDate.isBefore(joinDate)) {
            return null;
        }

        Optional<Attendance> existingAttendance = attendanceRepository.findByEmpIdAndAttendanceDate(employee.getId(), attendanceDate);
        Attendance attendance = existingAttendance.orElseGet(Attendance::new);

        attendance.setEmpId(employee.getId());
        attendance.setAttendanceDate(attendanceDate);
        attendance.setStartedAt(parseTimeCell(getCell(row, headerIndex, "START_TIME"), attendanceDate));
        attendance.setEndedAt(parseTimeCell(getCell(row, headerIndex, "END_TIME"), attendanceDate));
        attendance.setAttendance_status(getCellValue(getCell(row, headerIndex, "STATUS")));
        attendance.setWorking_status(getCellValue(getCell(row, headerIndex, "WORKING_MODE")));
        attendance.setDepartureNotes(getCellValue(getCell(row, headerIndex, "NOTES")));
        attendance.setEntryType("EXCEL_IMPORT");
        attendance.setCreatedBy(Optional.ofNullable(createdBy).orElse("SYSTEM_IMPORT"));
        return attendance;
    }

    private Cell getCell(Row row, Map<String, Integer> headerIndex, String header) {
        Integer columnIndex = headerIndex.get(header);
        return columnIndex == null || columnIndex < 0 ? null : row.getCell(columnIndex);
    }

    private LocalDate parseDateCell(Cell cell) {
        if (cell == null) return null;
        try {
            switch (cell.getCellType()) {
                case STRING:
                    String dateText = cell.getStringCellValue().trim();
                    return dateText.isEmpty() ? null : LocalDate.parse(dateText, DATE_FORMATTER);
                case NUMERIC:
                    return cell.getLocalDateTimeCellValue().toLocalDate();
                default:
                    return null;
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format in row " + cell.getRowIndex() + ". Please use yyyy-MM-dd.", e);
        }
    }

    private LocalDateTime parseTimeCell(Cell cell, LocalDate attendanceDate) {
        if (cell == null || attendanceDate == null) return null;
        try {
            String value = null;
            switch (cell.getCellType()) {
                case STRING:
                    value = cell.getStringCellValue().trim();
                    break;
                case NUMERIC:
                    return LocalDateTime.of(attendanceDate, cell.getLocalDateTimeCellValue().toLocalTime());
                default:
                    return null;
            }
            return (value == null || value.isBlank()) ? null : LocalDateTime.of(attendanceDate, LocalTime.parse(value, TIME_FORMATTER));
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid time format in row " + cell.getRowIndex() + ". Please use HH:mm.", e);
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf(cell.getNumericCellValue()).trim();
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue()).trim();
            case FORMULA: return Optional.ofNullable(cell.getCellFormula()).orElse("").trim();
            default: return null;
        }
    }

    private String formatLocalDateTime(LocalDateTime dateTime) {
        return dateTime == null ? "" : dateTime.format(DATE_TIME_FORMATTER);
    }
}
