package com.knoweb.HRM.controller;

import com.knoweb.HRM.model.CalendarEvent;
import com.knoweb.HRM.service.CalendarEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/calendar")
@CrossOrigin(origins = "http://129.212.239.12:5174")
public class CalendarEventController {

    @Autowired
    private CalendarEventService calendarEventService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Create new event
    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody CalendarEvent event) {
        try {
            // Get company ID from request or set it from context
            // For now, we'll assume it's set in the request
            if (event.getCompanyId() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 101);
                errorResponse.put("resultDesc", "Company ID is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            // Check for time conflicts
            if (calendarEventService.hasTimeConflict(event.getCompanyId(), 
                    event.getStartDate(), event.getEndDate(), null)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Event time conflicts with existing event");
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
            }

            CalendarEvent createdEvent = calendarEventService.createEvent(event);
            
            // Send real-time update to all clients
            messagingTemplate.convertAndSend("/topic/calendar/" + event.getCompanyId(), Map.of(
                "action", "CREATE",
                "event", createdEvent
            ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Event created successfully");
            response.put("event", createdEvent);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error creating event: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all events for a company
    @GetMapping("/events/company/{companyId}")
    public ResponseEntity<?> getEventsByCompany(@PathVariable Long companyId) {
        try {
            List<CalendarEvent> events = calendarEventService.getAllEventsByCompanyId(companyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Events retrieved successfully");
            response.put("events", events);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving events: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get events by date range
    @GetMapping("/events/company/{companyId}/range")
    public ResponseEntity<?> getEventsByDateRange(
            @PathVariable Long companyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<CalendarEvent> events = calendarEventService.getEventsByDateRange(companyId, startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Events retrieved successfully");
            response.put("events", events);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving events: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get events by month
    @GetMapping("/events/company/{companyId}/month/{year}/{month}")
    public ResponseEntity<?> getEventsByMonth(
            @PathVariable Long companyId,
            @PathVariable int year,
            @PathVariable int month) {
        try {
            List<CalendarEvent> events = calendarEventService.getEventsByMonth(companyId, year, month);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Events retrieved successfully");
            response.put("events", events);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving events: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get today's events
    @GetMapping("/events/company/{companyId}/today")
    public ResponseEntity<?> getTodayEvents(@PathVariable Long companyId) {
        try {
            List<CalendarEvent> events = calendarEventService.getTodayEvents(companyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Today's events retrieved successfully");
            response.put("events", events);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving today's events: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get upcoming events
    @GetMapping("/events/company/{companyId}/upcoming")
    public ResponseEntity<?> getUpcomingEvents(@PathVariable Long companyId) {
        try {
            List<CalendarEvent> events = calendarEventService.getUpcomingEvents(companyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Upcoming events retrieved successfully");
            response.put("events", events);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving upcoming events: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get event by ID
    @GetMapping("/events/{eventId}")
    public ResponseEntity<?> getEventById(@PathVariable Long eventId) {
        try {
            CalendarEvent event = calendarEventService.getEventById(eventId);
            if (event == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Event not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Event retrieved successfully");
            response.put("event", event);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving event: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update event
    @PutMapping("/events/{eventId}")
    public ResponseEntity<?> updateEvent(@PathVariable Long eventId, @RequestBody CalendarEvent updatedEvent) {
        try {
            // Check for time conflicts
            CalendarEvent existingEvent = calendarEventService.getEventById(eventId);
            if (existingEvent == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Event not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }

            if (calendarEventService.hasTimeConflict(existingEvent.getCompanyId(), 
                    updatedEvent.getStartDate(), updatedEvent.getEndDate(), eventId)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Event time conflicts with existing event");
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
            }

            CalendarEvent event = calendarEventService.updateEvent(eventId, updatedEvent);
            if (event == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Event not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
            
            // Send real-time update to all clients
            messagingTemplate.convertAndSend("/topic/calendar/" + event.getCompanyId(), Map.of(
                "action", "UPDATE",
                "event", event
            ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Event updated successfully");
            response.put("event", event);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error updating event: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update event status
    @PutMapping("/events/{eventId}/status")
    public ResponseEntity<?> updateEventStatus(@PathVariable Long eventId, @RequestBody Map<String, String> statusRequest) {
        try {
            String status = statusRequest.get("status");
            if (status == null || status.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 101);
                errorResponse.put("resultDesc", "Status is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            // Validate status value
            if (!status.equals("PENDING") && !status.equals("IN_PROGRESS") && 
                !status.equals("COMPLETED") && !status.equals("CANCELLED")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 102);
                errorResponse.put("resultDesc", "Invalid status value. Must be PENDING, IN_PROGRESS, COMPLETED, or CANCELLED");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            CalendarEvent event = calendarEventService.updateEventStatus(eventId, status);
            if (event == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Event not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
            
            // Send real-time update to all clients
            messagingTemplate.convertAndSend("/topic/calendar/" + event.getCompanyId(), Map.of(
                "action", "STATUS_UPDATE",
                "eventId", eventId,
                "status", status
            ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Event status updated successfully");
            response.put("event", event);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error updating event status: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete event
    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
        try {
            // Get event before deletion to send WebSocket notification
            CalendarEvent eventToDelete = calendarEventService.getEventById(eventId);
            if (eventToDelete == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Event not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }

            boolean deleted = calendarEventService.deleteEvent(eventId);
            if (!deleted) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("resultCode", 404);
                errorResponse.put("resultDesc", "Event not found");
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
            
            // Send real-time update to all clients
            messagingTemplate.convertAndSend("/topic/calendar/" + eventToDelete.getCompanyId(), Map.of(
                "action", "DELETE",
                "eventId", eventId
            ));
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Event deleted successfully");
            response.put("eventId", eventId);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error deleting event: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get events by type
    @GetMapping("/events/company/{companyId}/type/{eventType}")
    public ResponseEntity<?> getEventsByType(@PathVariable Long companyId, @PathVariable String eventType) {
        try {
            List<CalendarEvent> events = calendarEventService.getEventsByType(companyId, eventType);
            
            Map<String, Object> response = new HashMap<>();
            response.put("resultCode", 100);
            response.put("resultDesc", "Events retrieved successfully");
            response.put("events", events);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("resultCode", 500);
            errorResponse.put("resultDesc", "Error retrieving events: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
