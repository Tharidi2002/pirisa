package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceImportExportServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AttendanceValidator attendanceValidator;

    @InjectMocks
    private AttendanceImportExportService importExportService;

    @Test
    void importAttendanceFromExcel_shouldParseAndMapEmployeeAttendance() throws Exception {
        Employee employee = new Employee();
        employee.setId(15L);
        employee.setEpfNo("EPF-015");
        employee.setDateOfJoining("2025-01-01");
        when(employeeRepository.findByEpfNo("EPF-015")).thenReturn(Optional.of(employee));
        when(attendanceValidator.parseEmployeeJoinDate("2025-01-01"))
                .thenReturn(LocalDate.of(2025, 1, 1));
        when(attendanceRepository.findByEmpIdAndAttendanceDate(15L, LocalDate.of(2026, 10, 7)))
                .thenReturn(Optional.empty());

        var uploadedFile = excelFile();
        var imported = importExportService.importAttendanceFromExcel(uploadedFile, "HR Admin");

        assertThat(imported).hasSize(1);
        Attendance attendance = imported.get(0);
        assertThat(attendance.getEmpId()).isEqualTo(15L);
        assertThat(attendance.getAttendanceDate()).isEqualTo(LocalDate.of(2026, 10, 7));
        assertThat(attendance.getStartedAt()).hasToString("2026-10-07T08:45");
        assertThat(attendance.getEndedAt()).hasToString("2026-10-07T17:15");
        assertThat(attendance.getAttendance_status()).isEqualTo("PRESENT");
        assertThat(attendance.getDepartureNotes()).isEqualTo("Imported note");
        assertThat(attendance.getEntryType()).isEqualTo("EXCEL_IMPORT");
        assertThat(attendance.getCreatedBy()).isEqualTo("HR Admin");
    }

    @Test
    void importAttendanceFromExcel_shouldRejectEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);

        assertThatThrownBy(() -> importExportService.importAttendanceFromExcel(emptyFile, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must not be empty");
    }

    @Test
    void exportAttendanceToExcel_shouldCreateWorkbookWithAttendanceHeaders() throws Exception {
        when(attendanceRepository.findForCompanyReport(5L, null, null, null, null))
                .thenReturn(java.util.Collections.emptyList());

        byte[] contents = importExportService.exportAttendanceToExcel(5L, null, null, null, null);
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(contents))) {
            Row header = workbook.getSheet("Attendance").getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("Attendance ID");
            assertThat(header.getCell(4).getStringCellValue()).isEqualTo("Attendance Date");
        }
    }

    private MockMultipartFile excelFile() throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Attendance");
            Row header = sheet.createRow(0);
            String[] columns = {"EPF NO", "ATTENDANCE DATE", "START TIME", "END TIME", "STATUS", "NOTES"};
            for (int index = 0; index < columns.length; index++) {
                header.createCell(index).setCellValue(columns[index]);
            }

            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue("EPF-015");
            row.createCell(1).setCellValue("2026-10-07");
            row.createCell(2).setCellValue("08:45");
            row.createCell(3).setCellValue("17:15");
            row.createCell(4).setCellValue("PRESENT");
            row.createCell(5).setCellValue("Imported note");
            workbook.write(output);

            return new MockMultipartFile("file", "attendance.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
        }
    }
}
