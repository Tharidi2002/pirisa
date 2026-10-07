package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Attendance;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.repository.AttendanceRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AttendanceValidator attendanceValidator;

    @Mock
    private AttendanceReportService attendanceReportService;

    @Mock
    private AttendanceImportExportService attendanceImportExportService;

    @InjectMocks
    private AttendanceService attendanceService;

    @Test
    void markBulkAttendance_shouldPersistClientNotesAndReason() {
        ReflectionTestUtils.setField(attendanceService, "attendanceValidator", new AttendanceValidator());

        Employee employee = new Employee();
        employee.setId(7L);
        employee.setEpfNo("EPF-100");
        employee.setDateOfJoining("2025-01-01");

        Attendance attendance = new Attendance();
        attendance.setEmpId(7L);
        attendance.setAttendanceDate(LocalDate.of(2026, 9, 2));
        attendance.setStartedAt(LocalDateTime.of(2026, 9, 2, 9, 0));
        attendance.setEndedAt(LocalDateTime.of(2026, 9, 2, 17, 0));
        attendance.setAttendance_status("PRESENT");
        attendance.setWorking_status("FIELD_VISIT");
        attendance.setNotes("Official site visit");
        attendance.setReason("Official Field Work");
        attendance.setEntryType("MANUAL_HR");
        attendance.setCreatedBy("HR Admin");

        when(employeeRepository.findById(7L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<Attendance> saved = attendanceService.markBulkAttendance(List.of(attendance));

        assertThat(saved).hasSize(1);
        assertThat(saved.get(0).getDepartureNotes()).isEqualTo("Official site visit");
        assertThat(saved.get(0).getDepartureReason()).isEqualTo("Official Field Work");
    }

    @Test
    void markBulkAttendance_shouldSetServerTimeWhenManualAttendanceHasNoStartTime() {
        ReflectionTestUtils.setField(attendanceService, "attendanceValidator", new AttendanceValidator());

        LocalDate attendanceDate = LocalDate.now();
        Employee employee = new Employee();
        employee.setId(15L);
        employee.setDateOfJoining(attendanceDate.minusDays(1).toString());

        Attendance attendance = new Attendance();
        attendance.setEmpId(15L);
        attendance.setAttendanceDate(attendanceDate);
        attendance.setStartedAt(null);
        attendance.setAttendance_status("PRESENT");
        attendance.setWorking_status("OFFICE");
        attendance.setEntryType("MANUAL_HR");

        when(employeeRepository.findById(15L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        LocalDateTime beforeMark = LocalDateTime.now();
        List<Attendance> saved = attendanceService.markBulkAttendance(List.of(attendance));
        LocalDateTime afterMark = LocalDateTime.now();

        assertThat(saved.get(0).getStartedAt()).isNotNull();
        assertThat(saved.get(0).getStartedAt().toLocalDate()).isEqualTo(attendanceDate);
        assertThat(saved.get(0).getStartedAt()).isBetween(
                attendanceDate.atTime(beforeMark.toLocalTime()),
                attendanceDate.atTime(afterMark.toLocalTime()));
    }

    @Test
    void exportAttendanceToExcel_shouldQueryWithinCompanyAndRequestedFilters() throws Exception {
        LocalDate startDate = LocalDate.of(2026, 10, 1);
        LocalDate endDate = LocalDate.of(2026, 10, 31);
        when(attendanceImportExportService.exportAttendanceToExcel(42L, 7L, 19L, startDate, endDate))
            .thenReturn(new byte[] {1, 2, 3});

        byte[] workbook = attendanceService.exportAttendanceToExcel(
                42L, 7L, 19L, startDate, endDate);

        assertThat(workbook).isNotEmpty();
        verify(attendanceImportExportService).exportAttendanceToExcel(42L, 7L, 19L, startDate, endDate);
    }

    @Test
    void markBulkAttendance_shouldRejectAttendanceBeforeJoinDate() {
        ReflectionTestUtils.setField(attendanceService, "attendanceValidator", new AttendanceValidator());

        Employee employee = new Employee();
        employee.setId(8L);
        employee.setEpfNo("EPF-200");
        employee.setDateOfJoining("2026-10-10");

        Attendance attendance = new Attendance();
        attendance.setEmpId(8L);
        attendance.setAttendanceDate(LocalDate.of(2026, 10, 3));
        attendance.setStartedAt(LocalDateTime.of(2026, 10, 3, 9, 0));
        attendance.setEndedAt(LocalDateTime.of(2026, 10, 3, 17, 0));
        attendance.setAttendance_status("PRESENT");
        attendance.setWorking_status("OFFICE");

        when(employeeRepository.findById(8L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> attendanceService.markBulkAttendance(List.of(attendance)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("prior to the join date");
    }

    @Test
    void updateAttendanceStatus_shouldSaveHalfDayType() {
        Attendance attendance = new Attendance();
        attendance.setId(11L);
        attendance.setAttendance_status("PRESENT");
        attendance.setWorking_status("OFFICE");
        when(attendanceRepository.findById(11L)).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(attendance)).thenReturn(attendance);

        Attendance updated = attendanceService.updateAttendanceStatus(11L, "half_day", "afternoon");

        assertThat(updated.getAttendance_status()).isEqualTo("HALF_DAY");
        assertThat(updated.getWorking_status()).isEqualTo("OFFICE");
        assertThat(updated.getHalfDayType()).isEqualTo("AFTERNOON");
        verify(attendanceRepository).save(attendance);
    }

    @Test
    void updateAttendanceStatus_shouldRejectHalfDayWithoutPeriod() {
        Attendance attendance = new Attendance();
        when(attendanceRepository.findById(12L)).thenReturn(Optional.of(attendance));

        assertThatThrownBy(() -> attendanceService.updateAttendanceStatus(12L, "HALF_DAY", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Half-day type");
    }

    @Test
    void updateAttendanceStatus_shouldClearTimesWhenMarkedAbsent() {
        Attendance attendance = new Attendance();
        attendance.setId(13L);
        attendance.setStartedAt(LocalDateTime.of(2026, 10, 7, 8, 30));
        attendance.setEndedAt(LocalDateTime.of(2026, 10, 7, 17, 0));
        when(attendanceRepository.findById(13L)).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(attendance)).thenReturn(attendance);

        Attendance updated = attendanceService.updateAttendanceStatus(13L, "ABSENT", null);

        assertThat(updated.getAttendance_status()).isEqualTo("ABSENT");
        assertThat(updated.getStartedAt()).isNull();
        assertThat(updated.getEndedAt()).isNull();
        verify(attendanceRepository).save(attendance);
    }

    @Test
    void updateAttendanceStatus_shouldSetServerTimeWhenAbsentIsChangedToPresent() {
        Attendance attendance = new Attendance();
        attendance.setId(16L);
        attendance.setAttendanceDate(LocalDate.now());
        attendance.setAttendance_status("ABSENT");
        attendance.setStartedAt(null);
        when(attendanceRepository.findById(16L)).thenReturn(Optional.of(attendance));
        when(attendanceRepository.save(attendance)).thenReturn(attendance);

        Attendance updated = attendanceService.updateAttendanceStatus(16L, "OFFICE", null);

        assertThat(updated.getAttendance_status()).isEqualTo("PRESENT");
        assertThat(updated.getStartedAt()).isNotNull();
        assertThat(updated.getStartedAt().toLocalDate()).isEqualTo(LocalDate.now());
        verify(attendanceRepository).save(attendance);
    }

    @Test
    void clockOutAttendance_shouldRejectAbsentAttendance() {
        Attendance attendance = new Attendance();
        attendance.setAttendance_status("ABSENT");
        attendance.setEndedAt(LocalDateTime.of(2026, 10, 7, 17, 0));
        when(attendanceRepository.findById(14L)).thenReturn(Optional.of(attendance));

        assertThatThrownBy(() -> attendanceService.clockOutAttendance(14L, "17:30", null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("absent employee");
    }
}
