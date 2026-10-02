package com.pirisa.hrm.service;

import com.pirisa.hrm.model.CalendarEvent;
import com.pirisa.hrm.repository.CalendarEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalendarEventServiceTest {
    @Mock
    private CalendarEventRepository calendarEventRepository;

    @InjectMocks
    private CalendarEventService calendarEventService;

    @Test
    void updatesEventWhenOptionalEndDateIsMissing() {
        LocalDateTime originalStart = LocalDateTime.of(2026, 10, 10, 10, 0);
        CalendarEvent existing = event(1L, originalStart, originalStart);
        CalendarEvent update = event(null, LocalDateTime.of(2026, 10, 11, 10, 0), null);
        update.setTitle("Updated event");
        when(calendarEventRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(calendarEventRepository.save(existing)).thenReturn(existing);

        CalendarEvent saved = calendarEventService.updateEvent(1L, update);

        assertThat(saved.getTitle()).isEqualTo("Updated event");
        assertThat(saved.getStartDate()).isEqualTo(update.getStartDate());
        assertThat(saved.getEndDate()).isEqualTo(update.getStartDate());
        verify(calendarEventRepository).save(existing);
    }

    @Test
    void rejectsEndDateBeforeStartDate() {
        CalendarEvent existing = event(1L, LocalDateTime.of(2026, 10, 10, 10, 0), null);
        CalendarEvent update = event(null, LocalDateTime.of(2026, 10, 11, 10, 0),
                LocalDateTime.of(2026, 10, 10, 9, 0));
        when(calendarEventRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> calendarEventService.updateEvent(1L, update))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Start date cannot be after end date");
        verify(calendarEventRepository, never()).save(existing);
    }

    private CalendarEvent event(Long id, LocalDateTime start, LocalDateTime end) {
        CalendarEvent event = new CalendarEvent();
        event.setId(id);
        event.setTitle("Test event");
        event.setStartDate(start);
        event.setEndDate(end);
        event.setEventType("MEETING");
        event.setColor("#2563EB");
        event.setCompanyId(1L);
        event.setVisibility("COMPANY_ONLY");
        event.setStatus("PENDING");
        event.setIsEndDateOptional(true);
        return event;
    }
}
