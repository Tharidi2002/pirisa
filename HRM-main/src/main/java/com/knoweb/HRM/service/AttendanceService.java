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
import java.util.stream.Collectors;

import com.knoweb.HRM.dto.AttendanceAttendedEmployeeDTO;
import com.knoweb.HRM.dto.AttendanceExcludedEmployeeDTO;
import com.knoweb.HRM.dto.AttendancePendingEmployeeDTO;
import com.knoweb.HRM.dto.BulkAttendanceDataDTO;

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

    public BulkAttendanceDataDTO getBulkAttendanceData(LocalDate attendanceDate, long companyId, Long departmentId) {
        List<Employee> employees = employeeRepository.findEmployeesByCompanyIdWithDetails(companyId);
        if (departmentId != null && departmentId > 0) {
            employees = employees.stream()
                    .filter(e -> e.getDptId() == departmentId)
                    .collect(Collectors.toList());
        }

        List<Attendance> attendedRecords = (departmentId != null && departmentId > 0)
                ? attendanceRepository.findByAttendanceDateAndDepartment(attendanceDate, departmentId)
                : attendanceRepository.findByAttendanceDate(attendanceDate);

        Set<Long> attendedEmpIds = attendedRecords.stream()
                .map(Attendance::getEmpId)
                .collect(Collectors.toSet());

        Map<Long, Employee> employeeMap = employees.stream()
                .collect(Collectors.toMap(Employee::getId, e -> e));

        List<AttendancePendingEmployeeDTO> pendingEmployees = employees.stream()
                .filter(employee -> !attendedEmpIds.contains(employee.getId()))
                .filter(employee -> isEmployeeEligibleForAttendance(employee, attendanceDate))
                .map(this::toPendingEmployeeDTO)
                .collect(Collectors.toList());

        List<AttendanceExcludedEmployeeDTO> excludedEmployees = employees.stream()
                .filter(employee -> !isEmployeeEligibleForAttendance(employee, attendanceDate))
                .map(this::toExcludedEmployeeDTO)
                .collect(Collectors.toList());

        List<AttendanceAttendedEmployeeDTO> attendedEmployees = attendedRecords.stream()
                .map(attendance -> toAttendedEmployeeDTO(attendance, employeeMap.get(attendance.getEmpId())))
                .collect(Collectors.toList());

        return new BulkAttendanceDataDTO(pendingEmployees, attendedEmployees, excludedEmployees);
    }

    private boolean isEmployeeEligibleForAttendance(Employee employee, LocalDate attendanceDate) {
        LocalDate joinDate = parseEmployeeJoinDate(employee.getDateOfJoining());
        return joinDate != null && !attendanceDate.isBefore(joinDate);
    }

    private AttendancePendingEmployeeDTO toPendingEmployeeDTO(Employee employee) {
        return new AttendancePendingEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDateOfJoining(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getDptName() : "Unassigned"
        );
    }

    private AttendanceExcludedEmployeeDTO toExcludedEmployeeDTO(Employee employee) {
        return new AttendanceExcludedEmployeeDTO(
                employee.getId(),
                employee.getEpfNo(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDateOfJoining(),
                employee.getDepartment() != null ? employee.getDepartment().getId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getDptName() : "Unassigned"
        );
    }

    private AttendanceAttendedEmployeeDTO toAttendedEmployeeDTO(Attendance attendance, Employee employee) {
        String firstName = employee != null ? employee.getFirstName() : "Unknown";
        String lastName = employee != null ? employee.getLastName() : "";
        String epfNo = employee != null ? employee.getEpfNo() : null;
        Long deptId = employee != null && employee.getDepartment() != null ? employee.getDepartment().getId() : null;
        String deptName = employee != null && employee.getDepartment() != null ? employee.getDepartment().getDptName() : "Unassigned";

        return new AttendanceAttendedEmployeeDTO(
                attendance.getEmpId(),
                epfNo,
                firstName,
                lastName,
                deptId,
                deptName,
                formatClockInTime(attendance.getStartedAt()),
                Optional.ofNullable(attendance.getAttendance_status()).orElse(""),
                attendance.getAttendanceDate() != null ? attendance.getAttendanceDate().format(DATE_FORMATTER) : "",
                attendance.getId()
        );
    }

    private String formatClockInTime(LocalDateTime startedAt) {
        return startedAt != null ? startedAt.format(DateTimeFormatter.ofPattern("HH:mm")) : "";
    }

    public List<Attendance> markBulkAttendance(List<Attendance> attendanceList) {
        if (attendanceList == null || attendanceList.isEmpty()) {
            throw new IllegalArgumentException("Attendance list cannot be empty");
        }

        List<Attendance> validatedList = new ArrayList<>();
        for (Attendance attendance : attendanceList) {
            if (attendance != null) {
                validateAttendanceJoinDate(attendance);
                validatedList.add(attendance);
            }
        }

        return attendanceRepository.saveAll(validatedList);
    }

    private void validateAttendanceJoinDate(Attendance attendance) {
        if (attendance == null || attendance.getAttendanceDate() == null || attendance.getEmpId() <= 0) {
            throw new IllegalArgumentException("Invalid attendance record provided");
        }

        Employee employee = employeeRepository.findById(attendance.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("Cannot validate attendance: employee not found."));

        LocalDate joinDate = parseEmployeeJoinDate(employee.getDateOfJoining());
        if (joinDate != null && attendance.getAttendanceDate().isBefore(joinDate)) {
            throw new IllegalArgumentException("Cannot mark attendance for employee " + employee.getEpfNo() + " prior to the join date.");
        }
    }

    private LocalDate parseEmployeeJoinDate(String dateOfJoining) {
        if (dateOfJoining == null || dateOfJoining.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateOfJoining, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            return null;
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

        return markBulkAttendance(attendanceRecords);
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
        String epfNo = getCellValue(row.getCell(headerIndex.getOrDefault("EPF_NO", -1)));
        if (epfNo == null || epfNo.isBlank()) {
            return null; // Skip rows without an EPF number
        }

        Employee employee = employeeRepository.findByEpfNo(epfNo.trim())
                .orElseThrow(() -> new IllegalArgumentException("Row " + (row.getRowNum() + 1) + ": Employee not found for EPF No '" + epfNo + "'"));

        LocalDate attendanceDate = parseDateCell(row.getCell(headerIndex.getOrDefault("ATTENDANCE_DATE", -1)));
        if (attendanceDate == null) {
            throw new IllegalArgumentException("Row " + (row.getRowNum() + 1) + ": Attendance Date is required for EPF No " + epfNo);
        }
        
        LocalDate joinDate = parseEmployeeJoinDate(employee.getDateOfJoining());
        if (joinDate != null && attendanceDate.isBefore(joinDate)) {
            System.out.println("Skipping attendance for " + epfNo + " on " + attendanceDate + " (before join date " + joinDate + ")");
            return null;
        }

        Optional<Attendance> existingAttendance = attendanceRepository.findByEmpIdAndAttendanceDate(employee.getId(), attendanceDate);
        Attendance attendance = existingAttendance.orElseGet(Attendance::new);

        attendance.setEmpId(employee.getId());
        attendance.setAttendanceDate(attendanceDate);

        attendance.setStartedAt(parseTimeCell(row.getCell(headerIndex.getOrDefault("START_TIME", -1)), attendanceDate));
        attendance.setEndedAt(parseTimeCell(row.getCell(headerIndex.getOrDefault("END_TIME", -1)), attendanceDate));
        
        attendance.setAttendance_status(getCellValue(row.getCell(headerIndex.getOrDefault("STATUS", -1))));
        attendance.setWorking_status(getCellValue(row.getCell(headerIndex.getOrDefault("WORKING_MODE", -1))));
        attendance.setDepartureNotes(getCellValue(row.getCell(headerIndex.getOrDefault("NOTES", -1))));

        attendance.setEntryType("EXCEL_IMPORT");
        attendance.setCreatedBy(Optional.ofNullable(createdBy).orElse("SYSTEM_IMPORT"));

        return attendance;
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

    public Attendance clockOutAttendance(long attendanceId, String endedAtText, String departureReason, String departureNotes) {
        Attendance attendance = getAttendanceById(attendanceId);
        if (attendance == null) {
            throw new IllegalArgumentException("Attendance record not found for id: " + attendanceId);
        }

        LocalDateTime parsedEndedAt = null;
        if (endedAtText != null && !endedAtText.isBlank()) {
            try {
                LocalTime time = LocalTime.parse(endedAtText.trim(), TIME_FORMATTER);
                parsedEndedAt = LocalDateTime.of(attendance.getAttendanceDate(), time);
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

    public List<Attendance> getAttendanceByEmployeeIdAndMonth(long empId, int month) {
        return attendanceRepository.findByEmpIdAndMonth(empId, month);
    }
}
