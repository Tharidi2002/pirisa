package com.knoweb.HRM.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.HRM.model.Attendance;
import com.knoweb.HRM.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @PostMapping(value = "/bulk-mark", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> bulkMarkAttendance(@RequestBody List<Attendance> attendanceList) {
        try {
            List<Attendance> savedEntries = attendanceService.markBulkAttendance(attendanceList);
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("resultCode", 100);
            responseBody.put("resultDesc", "Bulk attendance saved successfully");
            responseBody.put("attendanceList", savedEntries);
            return ResponseEntity.ok(responseBody);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to save bulk attendance"));
        }
    }

    @PostMapping(value = "/import-excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importAttendanceFromExcel(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "createdBy", required = false) String createdBy) {
        try {
            List<Attendance> importedRecords = attendanceService.importAttendanceFromExcel(file, createdBy);
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("resultCode", 100);
            responseBody.put("resultDesc", "Attendance imported successfully");
            responseBody.put("importedCount", importedRecords.size());
            responseBody.put("attendanceList", importedRecords);
            return ResponseEntity.ok(responseBody);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", ex.getMessage()));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Invalid Excel file format"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to import attendance from Excel"));
        }
    }

    @GetMapping(value = "/download-excel")
    public ResponseEntity<?> downloadAttendanceExcel(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "department", required = false) Long departmentId,
            @RequestParam(value = "empId", required = false) Long empId,
            @RequestParam(value = "startDate", required = false) String startDateText,
            @RequestParam(value = "endDate", required = false) String endDateText) {
        try {
            LocalDate startDate = parseDateOrNull(startDateText);
            LocalDate endDate = parseDateOrNull(endDateText);
            if (type != null && startDate != null) {
                LocalDate[] dateRange = buildDateRange(type, startDate);
                startDate = dateRange[0];
                endDate = dateRange[1];
            }
            byte[] excelBytes = attendanceService.exportAttendanceToExcel(type, departmentId, empId, startDate, endDate);
            String filename = buildExcelFilename(type, departmentId, empId, startDate, endDate);
            ByteArrayResource resource = new ByteArrayResource(excelBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(excelBytes.length)
                    .body(resource);
        } catch (DateTimeParseException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Invalid date format. Use yyyy-MM-dd."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", ex.getMessage()));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Unable to generate Excel report"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Unexpected error while downloading attendance report"));
        }
    }

    private LocalDate parseDateOrNull(String dateText) {
        if (dateText == null || dateText.isBlank()) {
            return null;
        }
        return LocalDate.parse(dateText, DATE_FORMATTER);
    }

    private LocalDate[] buildDateRange(String type, LocalDate anchorDate) {
        if (type == null) {
            return new LocalDate[]{anchorDate, anchorDate};
        }
        switch (type.trim().toUpperCase()) {
            case "DAILY":
                return new LocalDate[]{anchorDate, anchorDate};
            case "WEEKLY":
                return new LocalDate[]{anchorDate, anchorDate.plusDays(6)};
            case "MONTHLY":
                return new LocalDate[]{anchorDate.withDayOfMonth(1), anchorDate.withDayOfMonth(anchorDate.lengthOfMonth())};
            case "YEARLY":
                return new LocalDate[]{anchorDate.withDayOfYear(1), anchorDate.withDayOfYear(anchorDate.lengthOfYear())};
            default:
                return new LocalDate[]{anchorDate, anchorDate};
        }
    }

    private String buildExcelFilename(String type, Long departmentId, Long empId, LocalDate startDate, LocalDate endDate) {
        StringBuilder name = new StringBuilder("attendance-report");
        if (type != null && !type.isBlank()) {
            name.append("-").append(type.toLowerCase());
        }
        if (departmentId != null) {
            name.append("-dept-").append(departmentId);
        }
        if (empId != null) {
            name.append("-emp-").append(empId);
        }
        if (startDate != null) {
            name.append("-").append(startDate.format(DATE_FORMATTER));
        }
        if (endDate != null && !endDate.equals(startDate)) {
            name.append("-to-").append(endDate.format(DATE_FORMATTER));
        }
        name.append(".xlsx");
        return name.toString();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("resultCode", 101);
        errorResponse.put("resultDesc", "ERROR");

        String jsonResponse;
        try {
            jsonResponse = new ObjectMapper().writeValueAsString(errorResponse);
        } catch (Exception ex) {
            jsonResponse = "{\"resultCode\":101,\"resultDesc\":\"ERROR\"}";
        }
        return new ResponseEntity<>(jsonResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
