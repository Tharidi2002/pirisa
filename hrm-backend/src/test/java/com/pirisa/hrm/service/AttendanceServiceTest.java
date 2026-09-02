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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    @Test
    void markBulkAttendance_shouldPersistClientNotesAndReason() {
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
}
