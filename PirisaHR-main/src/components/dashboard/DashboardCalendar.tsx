// Alternative approach: Use native WebSocket implementation to avoid sockjs issues
import React, { useState, useEffect, useCallback } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  addMonths, 
  subMonths,
  isToday
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  MapPin, 
  Clock,
  Save
} from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventType: string;
  color: string;
  allDay: boolean;
  location?: string;
  createdBy?: number;
  companyId: number;
  createdAt: string;
  updatedAt?: string;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventType: string;
  color: string;
  allDay: boolean;
  location: string;
}

const EVENT_TYPES = [
  { value: "MEETING", label: "Meeting", color: "#3B82F6" },
  { value: "HOLIDAY", label: "Holiday", color: "#10B981" },
  { value: "DEADLINE", label: "Deadline", color: "#EF4444" },
  { value: "REMINDER", label: "Reminder", color: "#F59E0B" },
  { value: "FUNCTION", label: "Function", color: "#8B5CF6" },
  { value: "TRAINING", label: "Training", color: "#06B6D4" },
  { value: "OTHER", label: "Other", color: "#6B7280" }
];

const DashboardCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    eventType: "MEETING",
    color: "#3B82F6",
    allDay: false,
    location: ""
  });

  const companyId = localStorage.getItem("cmpnyId");
  const token = localStorage.getItem("token");

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (!companyId || !token) return;

    setWsStatus('connecting');
    
    try {
      // Use native WebSocket to avoid sockjs global issues
      const ws = new WebSocket("ws://localhost:8080/ws");
      
      ws.onopen = () => {
        console.log('Connected to WebSocket for calendar updates');
        setWsStatus('connected');
        
        // Subscribe to calendar updates for this company
        const subscribeMessage = {
          action: "SUBSCRIBE",
          topic: `/topic/calendar/${companyId}`,
          token: token
        };
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.action === "CREATE") {
            setEvents(prev => [...prev, message.event]);
          } else if (message.action === "UPDATE") {
            setEvents(prev => 
              prev.map(event => 
                event.id === message.event.id ? message.event : event
              )
            );
          } else if (message.action === "DELETE") {
            setEvents(prev => 
              prev.filter(event => event.id !== message.eventId)
            );
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket connection failed - falling back to HTTP polling:', error);
        setWsStatus('disconnected');
        setError('Real-time updates unavailable. Using HTTP polling instead.');
        setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setWsStatus('disconnected');
      };
      
      return () => {
        try {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        } catch (error) {
          console.error('Error closing WebSocket:', error);
        }
      };
    } catch (error) {
      console.warn('WebSocket not available - using HTTP polling only:', error);
      setWsStatus('disconnected');
      setError('Real-time updates unavailable. Using HTTP polling instead.');
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
      return () => {}; // Return empty cleanup function if connection fails
    }
  }, [companyId, token]);

  // Fetch events for current month
  const fetchEvents = useCallback(async () => {
    if (!companyId || !token) return;

    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const response = await fetch(
        `http://localhost:8080/calendar/events/company/${companyId}/month/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      console.log('Fetched events data:', data);
      if (data.resultCode === 100) {
        console.log('Setting events:', data.events);
        setEvents(data.events || []);
      } else {
        throw new Error(data.resultDesc || "Failed to fetch events");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [companyId, token, currentMonth]);

  // Filter events based on search term
  useEffect(() => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  // Real-time updates with WebSocket and interval
  useEffect(() => {
    fetchEvents();
    const disconnectWebSocket = connectWebSocket();

    const intervalId = setInterval(fetchEvents, 30000); // Update every 30 seconds

    const handleFocus = () => {
      fetchEvents();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchEvents();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (disconnectWebSocket) {
        disconnectWebSocket();
      }
    };
  }, [fetchEvents, connectWebSocket]);

  // Generate calendar days
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // Custom implementation to generate days in interval
    const days: Date[] = [];
    let currentDay = startDate;
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay = addDays(currentDay, 1);
    }

    return days.map((day: Date, index: number) => {
      const dayEvents = filteredEvents.filter(event => {
        try {
          const eventDate = new Date(event.startDate);
          const isMatch = isSameDay(eventDate, day);
          if (isMatch) {
            console.log('Event found for day:', day, 'Event:', event);
          }
          return isMatch;
        } catch (error) {
          console.error('Error parsing event date:', error, event);
          return false;
        }
      });

      if (dayEvents.length > 0) {
        console.log(`Day ${format(day, 'yyyy-MM-dd')} has ${dayEvents.length} events:`, dayEvents);
      }

      return (
        <div
          key={index}
          className={`min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            !isSameMonth(day, currentMonth) ? "bg-gray-50 text-gray-400" : ""
          } ${isToday(day) ? "bg-blue-50" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday(day) ? "text-blue-600" : ""
          }`}>
            {format(day, "d")}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event: CalendarEvent, eventIndex: number) => (
              <div
                key={eventIndex}
                className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                style={{ backgroundColor: event.color + "20", color: event.color }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
              >
                {event.allDay ? (
                  <span className="font-medium">{event.title}</span>
                ) : (
                  <span>
                    {(() => {
                      try {
                        const eventDate = new Date(event.startDate);
                        return format(eventDate, "HH:mm") + " " + event.title;
                      } catch (error) {
                        console.error('Error formatting event time:', error);
                        return event.title;
                      }
                    })()}
                  </span>
                )}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const handleDateClick = (date: Date) => {
    setIsEditing(false);
    const dateStr = format(date, "yyyy-MM-dd");
    const timeStr = format(date, "HH:mm");
    const startDateTime = formData.allDay ? dateStr : `${dateStr}T${timeStr}`;
    const endDateTime = formData.allDay ? dateStr : `${dateStr}T${timeStr}`;
    
    setFormData({
      title: "",
      description: "",
      startDate: startDateTime,
      endDate: endDateTime,
      eventType: "MEETING",
      color: "#3B82F6",
      allDay: false,
      location: ""
    });
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCreateEvent = async () => {
    if (!companyId || !token) return;

    // Validation
    if (!formData.title.trim()) {
      setError('Event title is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const eventData = {
        ...formData,
        companyId: parseInt(companyId),
        createdBy: parseInt(localStorage.getItem("userId") || "0")
      };

      const response = await fetch(
        "http://localhost:8080/calendar/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.resultDesc || "Failed to create event");
      }

      await fetchEvents();
      setShowEventModal(false);
      setFormData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        eventType: "MEETING",
        color: "#3B82F6",
        allDay: false,
        location: ""
      });
      setError('Event created successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !token) return;

    // Validation
    if (!formData.title.trim()) {
      setError('Event title is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/calendar/events/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.resultDesc || "Failed to update event");
      }

      await fetchEvents();
      setShowEventModal(false);
      setShowEventDetails(false);
      setIsEditing(false);
      setError('Event updated successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/calendar/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      await fetchEvents();
      setShowEventDetails(false);
      setError('Event deleted successfully!');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    let startDateTime, endDateTime;
    
    try {
      // Handle database LocalDateTime format
      const startDate = new Date(selectedEvent.startDate);
      const endDate = new Date(selectedEvent.endDate);
      
      const dateStr = format(startDate, "yyyy-MM-dd");
      const startTimeStr = format(startDate, "HH:mm");
      const endTimeStr = format(endDate, "HH:mm");
      
      startDateTime = selectedEvent.allDay ? dateStr : `${dateStr}T${startTimeStr}`;
      endDateTime = selectedEvent.allDay ? dateStr : `${dateStr}T${endTimeStr}`;
    } catch (error) {
      console.error('Error parsing event dates for edit:', error);
      // Fallback to original string
      startDateTime = selectedEvent.startDate.replace(" ", "T");
      endDateTime = selectedEvent.endDate.replace(" ", "T");
    }
    
    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description,
      startDate: startDateTime,
      endDate: endDateTime,
      eventType: selectedEvent.eventType,
      color: selectedEvent.color,
      allDay: selectedEvent.allDay,
      location: selectedEvent.location || ""
    });
    setIsEditing(true);
    setShowEventDetails(false);
    setShowEventModal(true);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Company Calendar</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 0 0-14 0 7 7 0 0114 0zm0 0l6 6" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected' ? 'bg-green-500' : 
                wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                {wsStatus === 'connected' ? 'Live Updates' : 
                 wsStatus === 'connecting' ? 'Connecting...' : 'HTTP Polling'}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleDateClick(new Date())}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-lg font-medium text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Event Type Legend */}
        <div className="flex items-center space-x-4 text-sm">
          {EVENT_TYPES.slice(0, 4).map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-gray-600">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {/* Weekday headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-b border-gray-200 bg-gray-50">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {renderDays()}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? "Edit Event" : "Create Event"}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Event description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => {
                    const selectedType = EVENT_TYPES.find(t => t.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      eventType: e.target.value,
                      color: selectedType?.color || "#3B82F6"
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type={formData.allDay ? "date" : "datetime-local"}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type={formData.allDay ? "date" : "datetime-local"}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event location (optional)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                  All Day Event
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? handleUpdateEvent : handleCreateEvent}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} />
                  <span>{isEditing ? "Update" : "Create"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <button
                onClick={() => setShowEventDetails(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg" style={{ color: selectedEvent.color }}>
                  {selectedEvent.title}
                </h4>
                <span 
                  className="inline-block px-2 py-1 text-xs rounded-full text-white mt-2"
                  style={{ backgroundColor: selectedEvent.color }}
                >
                  {EVENT_TYPES.find(t => t.value === selectedEvent.eventType)?.label || selectedEvent.eventType}
                </span>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>
                  {selectedEvent.allDay ? "All Day" : 
                    (() => {
                      try {
                        const startDate = new Date(selectedEvent.startDate);
                        const endDate = new Date(selectedEvent.endDate);
                        return `${format(startDate, "MMM dd, yyyy HH:mm")} - ${format(endDate, "HH:mm")}`;
                      } catch (error) {
                        console.error('Error formatting event dates:', error);
                        return `${selectedEvent.startDate} - ${selectedEvent.endDate}`;
                      }
                    })()
                  }
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => handleEditEvent()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCalendar;
