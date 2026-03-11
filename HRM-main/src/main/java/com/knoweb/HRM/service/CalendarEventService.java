package com.knoweb.HRM.service;

import com.knoweb.HRM.model.CalendarEvent;
import com.knoweb.HRM.repository.CalendarEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CalendarEventService {

    @Autowired
    private CalendarEventRepository calendarEventRepository;

    // Create a new calendar event
    public CalendarEvent createEvent(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }

    // Get all events for a company
    public List<CalendarEvent> getAllEventsByCompanyId(Long companyId) {
        return calendarEventRepository.findByCompanyId(companyId);
    }

    // Get event by ID
    public CalendarEvent getEventById(Long eventId) {
        Optional<CalendarEvent> event = calendarEventRepository.findById(eventId);
        return event.orElse(null);
    }

    // Update an existing event
    public CalendarEvent updateEvent(Long eventId, CalendarEvent updatedEvent) {
        Optional<CalendarEvent> existingEvent = calendarEventRepository.findById(eventId);
        if (existingEvent.isPresent()) {
            CalendarEvent event = existingEvent.get();
            
            // Update fields
            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setStartDate(updatedEvent.getStartDate());
            event.setEndDate(updatedEvent.getEndDate());
            event.setEventType(updatedEvent.getEventType());
            event.setColor(updatedEvent.getColor());
            event.setAllDay(updatedEvent.getAllDay());
            event.setLocation(updatedEvent.getLocation());
            
            // Update status if provided
            if (updatedEvent.getStatus() != null) {
                event.setStatus(updatedEvent.getStatus());
            }
            
            // Update other fields if provided
            if (updatedEvent.getCompletionPercentage() != null) {
                event.setCompletionPercentage(updatedEvent.getCompletionPercentage());
            }
            if (updatedEvent.getHasTime() != null) {
                event.setHasTime(updatedEvent.getHasTime());
            }
            if (updatedEvent.getIsEndDateOptional() != null) {
                event.setIsEndDateOptional(updatedEvent.getIsEndDateOptional());
            }
            
            return calendarEventRepository.save(event);
        }
        return null;
    }

    // Update event status only
    public CalendarEvent updateEventStatus(Long eventId, String status) {
        Optional<CalendarEvent> existingEvent = calendarEventRepository.findById(eventId);
        if (existingEvent.isPresent()) {
            CalendarEvent event = existingEvent.get();
            event.setStatus(status);
            return calendarEventRepository.save(event);
        }
        return null;
    }

    // Delete an event
    public boolean deleteEvent(Long eventId) {
        if (calendarEventRepository.existsById(eventId)) {
            calendarEventRepository.deleteById(eventId);
            return true;
        }
        return false;
    }

    // Get events for a specific date range
    public List<CalendarEvent> getEventsByDateRange(Long companyId, LocalDateTime startDate, LocalDateTime endDate) {
        return calendarEventRepository.findByCompanyIdAndDateRange(companyId, startDate, endDate);
    }

    // Get events for a specific month
    public List<CalendarEvent> getEventsByMonth(Long companyId, int year, int month) {
        return calendarEventRepository.findByCompanyIdAndMonth(companyId, year, month);
    }

    // Get events by type
    public List<CalendarEvent> getEventsByType(Long companyId, String eventType) {
        return calendarEventRepository.findByCompanyIdAndEventType(companyId, eventType);
    }

    // Get upcoming events
    public List<CalendarEvent> getUpcomingEvents(Long companyId) {
        return calendarEventRepository.findUpcomingEvents(companyId, LocalDateTime.now());
    }

    // Get today's events
    public List<CalendarEvent> getTodayEvents(Long companyId) {
        return calendarEventRepository.findTodayEvents(companyId);
    }

    // Check if event time conflicts exist
    public boolean hasTimeConflict(Long companyId, LocalDateTime startDate, LocalDateTime endDate, Long excludeEventId) {
        List<CalendarEvent> existingEvents = calendarEventRepository.findByCompanyIdAndDateRange(companyId, startDate, endDate);
        
        for (CalendarEvent event : existingEvents) {
            if (excludeEventId != null && event.getId().equals(excludeEventId)) {
                continue; // Skip the event being updated
            }
            
            // Check for overlap
            if (isTimeOverlap(startDate, endDate, event.getStartDate(), event.getEndDate())) {
                return true;
            }
        }
        return false;
    }

    // Helper method to check time overlap
    private boolean isTimeOverlap(LocalDateTime start1, LocalDateTime end1, LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    // Get events count by type for dashboard
    public long getEventsCountByType(Long companyId, String eventType) {
        return calendarEventRepository.findByCompanyIdAndEventType(companyId, eventType).size();
    }
}
