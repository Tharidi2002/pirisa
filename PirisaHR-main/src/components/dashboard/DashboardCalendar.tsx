import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
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
  isToday,
  isValid
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Plus,
  Wifi,
  WifiOff,
  Loader,
  X,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Save
} from "lucide-react";

// ==================== Types & Interfaces ====================
interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  allDay?: boolean;
  hasTime?: boolean;
  status?: string;
  isEndDateOptional?: boolean;
}

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  allDay: boolean;
  isEndDateOptional: boolean;
  hasTime: boolean;
}

// ==================== Constants ====================
const STATUS_CONFIG = {
  PENDING: { color: '#F59E0B', label: 'Pending', icon: Clock },
  IN_PROGRESS: { color: '#3B82F6', label: 'In Progress', icon: Loader },
  COMPLETED: { color: '#10B981', label: 'Completed', icon: Calendar },
  CANCELLED: { color: '#EF4444', label: 'Cancelled', icon: X }
} as const;

// ==================== Helper Functions ====================
const formatEventDate = (dateStr: string, includeTime: boolean = true): string => {
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) return dateStr;
    return includeTime ? format(date, "MMM dd, yyyy HH:mm") : format(date, "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
};

const getEventStatus = (event: CalendarEvent): string => {
  if (event.status) return event.status;

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : startDate;

  if (now < startDate) return 'PENDING';
  if (now >= startDate && now <= endDate) return 'IN_PROGRESS';
  if (now > endDate) return 'COMPLETED';

  return 'PENDING';
};

// ==================== Main Component ====================
const DashboardCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    allDay: false,
    isEndDateOptional: false,
    hasTime: true
  });

  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId");
  const clientRef = useRef<Client | null>(null);

  // ==================== Memoized Values ====================
  const filteredEvents = useMemo(() => {
    return events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // ==================== Helper Functions ====================
  const updateEventStatuses = useCallback(() => {
    setEvents(prevEvents => prevEvents.map(event => ({
      ...event,
      status: event.status || getEventStatus(event)
    })));
  }, []);

  const getStatusColor = (status: string): string => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || '#3B82F6';
  };

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.icon;
    return Icon ? <Icon size={12} className="mr-1" /> : null;
  };

  // ==================== API Calls ====================
  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8081/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleStatusChange = async (eventId: number, newStatus: string): Promise<void> => {
    const isConfirmed = window.confirm(`Are you sure you want to update the event status to ${newStatus}?`);

    if (!isConfirmed) return;

    setStatusUpdateLoading(eventId);

    try {
      const response = await fetch(
          `http://localhost:8081/api/calendar/events/${eventId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          }
      );

      if (response.ok) {
        setSuccessMessage(`Event status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchEvents();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      setError('Failed to update event status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // ==================== Form Handlers ====================
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      allDay: false,
      isEndDateOptional: false,
      hasTime: true
    });
    setIsEditing(false);
    setSelectedEvent(null);
  };

  const toggleEndDateOptional = () => {
    setFormData(prev => ({
      ...prev,
      isEndDateOptional: !prev.isEndDateOptional,
      endDate: !prev.isEndDateOptional ? '' : prev.endDate
    }));
  };

  const handleCreateEvent = async (): Promise<void> => {
    if (!companyId || !token) return;

    if (!formData.title.trim()) {
      setError('Event title is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const endDateToUse = formData.isEndDateOptional && !formData.endDate
        ? null
        : formData.endDate || formData.startDate;

    try {
      const response = await fetch('http://localhost:8081/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: endDateToUse,
          location: formData.location,
          allDay: formData.allDay,
          companyId: parseInt(companyId),
          isEndDateOptional: formData.isEndDateOptional,
          hasTime: formData.hasTime
        }),
      });

      if (response.ok) {
        setSuccessMessage('Event created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowEventModal(false);
        resetForm();
        fetchEvents();
      } else {
        throw new Error('Failed to create event');
      }
    } catch (err) {
      setError('Failed to create event');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateEvent = async (): Promise<void> => {
    if (!selectedEvent || !token) return;

    if (!formData.title.trim()) {
      setError('Event title is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const endDateToUse = formData.isEndDateOptional && !formData.endDate
        ? null
        : formData.endDate || formData.startDate;

    try {
      const response = await fetch(
          `http://localhost:8081/api/calendar/events/${selectedEvent.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              startDate: formData.startDate,
              endDate: endDateToUse,
              location: formData.location,
              allDay: formData.allDay,
              isEndDateOptional: formData.isEndDateOptional,
              hasTime: formData.hasTime
            }),
          }
      );

      if (response.ok) {
        setSuccessMessage('Event updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowEventModal(false);
        resetForm();
        fetchEvents();
      } else {
        throw new Error('Failed to update event');
      }
    } catch (err) {
      setError('Failed to update event');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteEvent = async (eventId: number): Promise<void> => {
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const response = await fetch(
          `http://localhost:8081/api/calendar/events/${eventId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
      );

      if (response.ok) {
        setSuccessMessage('Event deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        setShowEventDetails(false);
        resetForm();
        fetchEvents();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (err) {
      setError('Failed to delete event');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditEvent = (): void => {
    if (!selectedEvent) return;

    let startDateTime, endDateTime;
    const hasTime = selectedEvent.hasTime !== false;

    if (hasTime) {
      startDateTime = selectedEvent.startDate;
      endDateTime = selectedEvent.endDate || selectedEvent.startDate;
    } else {
      const startDate = new Date(selectedEvent.startDate);
      const endDate = selectedEvent.endDate ? new Date(selectedEvent.endDate) : startDate;
      startDateTime = format(startDate, "yyyy-MM-dd");
      endDateTime = format(endDate, "yyyy-MM-dd");
    }

    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      startDate: startDateTime,
      endDate: endDateTime,
      location: selectedEvent.location || '',
      allDay: selectedEvent.allDay || false,
      isEndDateOptional: selectedEvent.isEndDateOptional || false,
      hasTime: hasTime
    });
    setIsEditing(true);
    setShowEventDetails(false);
    setShowEventModal(true);
  };

  // ==================== WebSocket Connection ====================
  const connectWebSocket = useCallback((): (() => void) => {
    if (!companyId || !token) return () => {};

    setWsStatus('connecting');

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
        connectHeaders: {
          'Authorization': `Bearer ${token}`,
        },
        debug: (str) => console.log('STOMP Debug:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        setWsStatus('connected');
        setError(null);

        client.subscribe('/topic/calendar/' + companyId, (message: IMessage) => {
          try {
            const event = JSON.parse(message.body);
            console.log('Received calendar event:', event);

            setEvents(prevEvents => {
              const existingIndex = prevEvents.findIndex(e => e.id === event.id);
              if (existingIndex >= 0) {
                const updatedEvents = [...prevEvents];
                updatedEvents[existingIndex] = event;
                return updatedEvents;
              } else {
                return [...prevEvents, event];
              }
            });
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        setWsStatus('disconnected');
        setError('Real-time updates unavailable. Using HTTP polling instead.');
        setTimeout(() => setError(null), 5000);
      };

      client.onDisconnect = () => {
        console.log('WebSocket disconnected');
        setWsStatus('disconnected');
      };

      client.activate();
      clientRef.current = client;

      return () => {
        if (client.connected) {
          client.deactivate();
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setWsStatus('disconnected');
      setError('Real-time updates unavailable. Using HTTP polling instead.');
      setTimeout(() => setError(null), 5000);
      return () => {};
    }
  }, [companyId, token, selectedEvent]);

  // ==================== Data Fetching ====================
  const fetchEvents = useCallback(async (): Promise<void> => {
    if (!companyId || !token) {
      console.log('Missing companyId or token');
      return;
    }

    try {
      const response = await fetch(
          `http://localhost:8081/api/calendar/events?companyId=${companyId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.resultCode === 100 && data.events) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }
      } else {
        throw new Error('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
      setTimeout(() => setError(null), 3000);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, token]);

  // ==================== Effects ====================
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const disconnect = connectWebSocket();
    return disconnect;
  }, [connectWebSocket]);

  useEffect(() => {
    updateEventStatuses();
    const interval = setInterval(updateEventStatuses, 60000);
    return () => clearInterval(interval);
  }, [updateEventStatuses]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (wsStatus === 'disconnected') {
        fetchEvents();
      }
    }, 30000);

    const handleFocus = () => {
      if (wsStatus === 'disconnected') {
        fetchEvents();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && wsStatus === 'disconnected') {
        fetchEvents();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [wsStatus, fetchEvents]);

  // ==================== Calendar Functions ====================
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days.map((day, index) => {
      const dayEvents = filteredEvents.filter(event => {
        try {
          return isSameDay(new Date(event.startDate), day);
        } catch {
          return false;
        }
      });

      return (
          <div
              key={index}
              className={`min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isSameMonth(day, currentMonth) ? 'bg-gray-50' : ''
              } ${isToday(day) ? 'bg-blue-50' : ''}`}
              onClick={() => {
                setSelectedDate(day);
                setShowEventModal(true);
              }}
          >
            <div className={`text-sm font-medium mb-1 ${
                isToday(day) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event, eventIndex) => {
                const status = getEventStatus(event);
                const StatusIcon = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.icon;

                return (
                    <div
                        key={eventIndex}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 relative group"
                        style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowEventDetails(true);
                        }}
                    >
                      <div className="flex items-center">
                        {StatusIcon && <StatusIcon size={12} className="mr-1" />}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                );
              })}
              {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} more
                  </div>
              )}
            </div>
          </div>
      );
    });
  };

  // ==================== Loading State ====================
  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-sky-500" size={48} />
        </div>
    );
  }

  // ==================== Main Render ====================
  return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Company Calendar</h2>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {wsStatus === 'connected' ? (
                  <Wifi className="text-green-500" size={16} />
              ) : wsStatus === 'connecting' ? (
                  <Loader className="text-yellow-500 animate-spin" size={16} />
              ) : (
                  <WifiOff className="text-red-500" size={16} />
              )}
              <span className="text-xs text-gray-500">
                {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>

            {/* Add Event Button */}
            <button
                onClick={() => {
                  resetForm();
                  setShowEventModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button
              onClick={() => setCurrentMonth(new Date())}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
          ))}
          {renderDays()}
        </div>

        {/* Event Modal */}
        {showEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEditing ? 'Edit Event' : 'Add New Event'}
                </h3>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Event title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Event description (optional)"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                        type={formData.hasTime ? "datetime-local" : "date"}
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* End Date */}
                  {!formData.isEndDateOptional && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type={formData.hasTime ? "datetime-local" : "date"}
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={formData.startDate}
                        />
                      </div>
                  )}

                  {/* All Day Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="allDay"
                        checked={formData.allDay}
                        onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                      All day event
                    </label>
                  </div>

                  {/* Time Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="hasTime"
                        checked={formData.hasTime}
                        onChange={(e) => setFormData({ ...formData, hasTime: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="hasTime" className="text-sm font-medium text-gray-700">
                      Include time
                    </label>
                  </div>

                  {/* End Date Optional Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isEndDateOptional"
                        checked={formData.isEndDateOptional}
                        onChange={toggleEndDateOptional}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isEndDateOptional" className="text-sm font-medium text-gray-700">
                      End date is optional
                    </label>
                  </div>

                  {/* Location */}
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

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                        onClick={() => {
                          setShowEventModal(false);
                          resetForm();
                        }}
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
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <button
                      onClick={() => setShowEventDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                    <div>
                      <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                    </div>
                )}

                {/* Date/Time */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>
                {selectedEvent.allDay ? "All Day" :
                    formatEventDate(selectedEvent.startDate, true) +
                    (selectedEvent.isEndDateOptional ? " (No end date)" :
                        selectedEvent.endDate ? " - " + formatEventDate(selectedEvent.endDate, true) : "")
                }
                </span>
                </div>

                {/* Location */}
                {selectedEvent.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{selectedEvent.location}</span>
                    </div>
                )}

                {/* Status Control */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((status) => {
                      const Icon = STATUS_CONFIG[status].icon;
                      const isCurrentStatus = getEventStatus(selectedEvent) === status;
                      const isLoading = statusUpdateLoading === selectedEvent.id;

                      return (
                          <button
                              key={status}
                              onClick={() => handleStatusChange(selectedEvent.id, status)}
                              disabled={isLoading}
                              className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center ${
                                  isCurrentStatus
                                      ? 'text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              style={{
                                backgroundColor: isCurrentStatus ? getStatusColor(status) : undefined
                              }}
                          >
                            {isLoading ? (
                                <Loader size={12} className="animate-spin mr-1" />
                            ) : (
                                <Icon size={12} className="mr-1" />
                            )}
                            {STATUS_CONFIG[status].label}
                          </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                      onClick={handleEditEvent}
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
        )}

        {/* Success Toast */}
        {successMessage && (
            <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg z-50 animate-slide-in">
              <div className="flex justify-between items-center">
                <span>{successMessage}</span>
                <button
                    onClick={() => setSuccessMessage(null)}
                    className="ml-4 text-green-500 hover:text-green-700"
                    aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
        )}

        {/* Error Toast */}
        {error && (
            <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50 animate-slide-in">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                    onClick={() => setError(null)}
                    className="ml-4 text-red-500 hover:text-red-700"
                    aria-label="Close"
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
