import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface AttendanceRecord {
  id: number;
  startedAt: string;
  endedAt: string | null;
  working_status: string;
  attendance_status?: string | null;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  epfNo: string;
  photo?: {
    photoUrl?: string;
  };
  attendanceList: AttendanceRecord[];
}

interface ApiResponse {
  resultCode: number;
  resultDesc: string;
  EmployeeList: Employee[];
}

interface EmpDetailsLeaveDTO {
  id: number;
  leaveType: string;
  leaveReason: string;
  leaveStatus: string;
  leaveStartDay: string;
  leaveEndDay: string;
  leaveDays: number;
}

interface EmpDetailsDTO {
  id: number;
  firstName: string;
  lastName: string;
  leaveList?: EmpDetailsLeaveDTO[];
}

interface EmpDetailsApiResponse {
  resultCode: number;
  resultDesc: string;
  EmployeeList: EmpDetailsDTO[];
}

interface DayInfo {
  date: number;
  isCurrentMonth: boolean;
  dateKey: string;
  isToday: boolean;
}

interface DaySummary {
  present: number;
  leave: number;
  absent: number;
  pending: number;
  total: number;
}

const parseDateSafe = (value: unknown): Date | null => {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isAttendanceEnded = (att: AttendanceRecord): boolean => {
  const end = parseDateSafe(att.endedAt);
  if (end) return true;
  const status = (att.attendance_status ?? "").toString().trim().toLowerCase();
  return Boolean(status && status !== "active" && status !== "in progress");
};

const MonthlyAttendanceCalendar = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveByEmpId, setLeaveByEmpId] = useState<Record<number, EmpDetailsLeaveDTO[]>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toDateKeyLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getDailySummary = useCallback((dateKey: string): DaySummary => {
    const summary: DaySummary = {
      present: 0,
      leave: 0,
      absent: 0,
      pending: 0,
      total: employees.length
    };

    employees.forEach(employee => {
      // Check if on leave
      const leaves = leaveByEmpId[employee.id] || [];
      let isOnLeave = false;
      
      for (const leave of leaves) {
        if (leave.leaveStatus.toUpperCase() !== "APPROVED") continue;
        const start = parseDateSafe(leave.leaveStartDay);
        const end = parseDateSafe(leave.leaveEndDay);
        if (!start || !end) continue;
        
        const checkDate = new Date(dateKey);
        if (checkDate >= start && checkDate <= end) {
          isOnLeave = true;
          break;
        }
      }

      if (isOnLeave) {
        summary.leave++;
        return;
      }

      // Check attendance
      const attendanceRecords = employee.attendanceList.filter(att => {
        const attDate = parseDateSafe(att.startedAt);
        if (!attDate) return false;
        return toDateKeyLocal(attDate) === dateKey;
      });

      if (attendanceRecords.length > 0) {
        const hasEnded = attendanceRecords.some(att => isAttendanceEnded(att));
        if (hasEnded) {
          summary.present++;
        } else {
          summary.pending++;
        }
      } else {
        summary.absent++;
      }
    });

    return summary;
  }, [employees, leaveByEmpId]);

  const getCalendarDays = (year: number, month: number): DayInfo[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: DayInfo[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        date: day,
        isCurrentMonth: false,
        dateKey: toDateKeyLocal(new Date(prevYear, prevMonth, day)),
        isToday: false
      });
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: day,
        isCurrentMonth: true,
        dateKey: toDateKeyLocal(date),
        isToday: toDateKeyLocal(date) === toDateKeyLocal(today)
      });
    }
    
    // Next month days to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        date: day,
        isCurrentMonth: false,
        dateKey: toDateKeyLocal(new Date(nextYear, nextMonth, day)),
        isToday: false
      });
    }
    
    return days;
  };

  const fetchEmployeePhotos = async (employeeList: Employee[], token: string) => {
    const photoPromises = employeeList.map(async (employee) => {
      try {
        const existsResp = await fetch(
          `http://localhost:8080/api/profile-image/exists/${employee.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!existsResp.ok) return { id: employee.id, url: null };
        const existsData: { hasProfileImage?: boolean; exists?: boolean } = await existsResp.json();
        const hasImage = Boolean(existsData?.hasProfileImage ?? existsData?.exists);
        if (!hasImage) return { id: employee.id, url: null };

        const photoResponse = await fetch(
          `http://localhost:8080/api/profile-image/view/${employee.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!photoResponse.ok) return { id: employee.id, url: null };
        const blob = await photoResponse.blob();
        if (!blob || blob.size === 0) return { id: employee.id, url: null };

        const imageUrl = URL.createObjectURL(blob);
        return { id: employee.id, url: imageUrl };
      } catch {
        return { id: employee.id, url: null };
      }
    });

    const photoResults = await Promise.all(photoPromises);
    const photoUrlMap: Record<number, string> = {};
    photoResults.forEach(({ id, url }) => { if (url) photoUrlMap[id] = url; });
    setPhotoUrls(photoUrlMap);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("cmpnyId");

      if (!token || !companyId) {
        navigate("/login");
        return;
      }

      const [attendanceResponse, leaveResponse] = await Promise.all([
        fetch(`http://localhost:8080/employee/attendanceList/${companyId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        }),
        fetch(`http://localhost:8080/employee/EmpDetailsList/${companyId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        })
      ]);

      if (!attendanceResponse.ok) {
        if (attendanceResponse.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch attendance data");
      }

      const attendanceData: ApiResponse = await attendanceResponse.json();
      
      let leaveMap: Record<number, EmpDetailsLeaveDTO[]> = {};
      if (leaveResponse.ok) {
        try {
          const leaveJson: EmpDetailsApiResponse = await leaveResponse.json();
          if (leaveJson?.resultCode === 100 && Array.isArray(leaveJson?.EmployeeList)) {
            for (const emp of leaveJson.EmployeeList) {
              leaveMap[emp.id] = Array.isArray(emp?.leaveList) ? emp.leaveList : [];
            }
          }
        } catch {
          leaveMap = {};
        }
      }

      if (attendanceData.resultCode === 100) {
        const employeeList = attendanceData.EmployeeList || [];
        setEmployees(employeeList);
        setLeaveByEmpId(leaveMap);
        if (employeeList.length > 0) {
          await fetchEmployeePhotos(employeeList, token);
        }
      } else {
        setEmployees([]);
        setLeaveByEmpId({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const isFutureDate = (dateKey: string): boolean => {
    const today = new Date();
    const todayKey = toDateKeyLocal(today);
    return dateKey > todayKey;
  };

  const getSummaryColor = (summary: DayInfo): string => {
    if (isFutureDate(summary.dateKey)) return "bg-gray-200";
    const daySummary = getDailySummary(summary.dateKey);
    const presentPercentage = daySummary.total > 0 ? (daySummary.present / daySummary.total) * 100 : 0;
    
    if (presentPercentage >= 80) return "bg-green-500";
    if (presentPercentage >= 60) return "bg-yellow-500";
    if (presentPercentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => { setError(null); fetchData(); }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-sky-500 flex-shrink-0" />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 break-words">Monthly Attendance Calendar</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <div className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
              {monthNames[currentMonth]} {currentYear}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded bg-green-500"></span>
          <span className="text-gray-700 text-xs sm:text-sm">Present</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded bg-orange-400"></span>
          <span className="text-gray-700 text-xs sm:text-sm">Leave</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded bg-yellow-400"></span>
          <span className="text-gray-700 text-xs sm:text-sm">In Progress</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded bg-red-400"></span>
          <span className="text-gray-700 text-xs sm:text-sm">Absent</span>
        </div>
      </div>

      {/* Monthly Summary Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-1 sm:p-2 lg:p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 lg:gap-2 mb-1 sm:mb-2">
            {weekdayLabels.map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 lg:gap-2">
            {calendarDays.map((day, index) => {
              const summary = getDailySummary(day.dateKey);
              const bgColor = getSummaryColor(day);
              
              return (
                <div
                  key={index}
                  className={`
                    relative aspect-square rounded border flex flex-col items-center justify-center
                    ${day.isCurrentMonth && !isFutureDate(day.dateKey) ? "cursor-pointer hover:scale-105" : "cursor-default"}
                    transition-all
                    ${day.isCurrentMonth ? "border-gray-200" : "border-gray-100 bg-gray-50"}
                    ${day.isToday ? "ring-1 sm:ring-2 ring-sky-500" : ""}
                  `}
                  onClick={() => !isFutureDate(day.dateKey) && setSelectedDate(day.dateKey)}
                  title={`${day.dateKey}: ${isFutureDate(day.dateKey) ? 'Future date' : `${summary.present} present, ${summary.leave} leave, ${summary.absent} absent, ${summary.pending} pending`}`}
                >
                  <span className={`text-xs sm:text-sm font-bold ${day.isCurrentMonth ? "text-gray-700" : "text-gray-400"}`}>
                    {day.date}
                  </span>
                  {day.isCurrentMonth && !isFutureDate(day.dateKey) && (
                    <>
                      <div className={`w-full h-0.5 sm:h-1 rounded-full mt-0.5 sm:mt-1 ${bgColor}`}></div>
                      <div className="text-xs text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">
                        {summary.present}/{summary.total}
                      </div>
                    </>
                  )}
                  {day.isCurrentMonth && isFutureDate(day.dateKey) && (
                    <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                      Future
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && !isFutureDate(selectedDate) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-1 sm:p-2 lg:p-4">
          <div className="w-full max-w-lg sm:max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden max-h-[95vh] sm:max-h-[90vh] lg:max-h-[80vh]">
            <div className="flex items-center justify-between px-2 sm:px-3 lg:px-4 py-2 sm:py-3 border-b border-gray-200">
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 pr-2">
                <div className="hidden sm:block">
                  Attendance Summary for {new Date(selectedDate).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="sm:hidden text-center">
                  {new Date(selectedDate).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="px-1.5 sm:px-2 lg:px-3 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 flex-shrink-0 text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
            
            <div className="p-2 sm:p-3 lg:p-4 overflow-auto max-h-[80vh] sm:max-h-[75vh] lg:max-h-[60vh]">
              {(() => {
                const summary = getDailySummary(selectedDate);
                const presentPercentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;
                
                return (
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 lg:gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 sm:p-2 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-2xl font-bold text-green-700">{summary.present}</div>
                        <div className="text-xs sm:text-sm text-green-600">Present</div>
                        <div className="text-xs text-green-500">{presentPercentage}%</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-1.5 sm:p-2 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-2xl font-bold text-orange-700">{summary.leave}</div>
                        <div className="text-xs sm:text-sm text-orange-600">On Leave</div>
                        <div className="text-xs text-orange-500">
                          {summary.total > 0 ? Math.round((summary.leave / summary.total) * 100) : 0}%
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-1.5 sm:p-2 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-2xl font-bold text-red-700">{summary.absent}</div>
                        <div className="text-xs sm:text-sm text-red-600">Absent</div>
                        <div className="text-xs text-red-500">
                          {summary.total > 0 ? Math.round((summary.absent / summary.total) * 100) : 0}%
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1.5 sm:p-2 lg:p-4">
                        <div className="text-base sm:text-lg lg:text-2xl font-bold text-yellow-700">{summary.pending}</div>
                        <div className="text-xs sm:text-sm text-yellow-600">In Progress</div>
                        <div className="text-xs text-yellow-500">
                          {summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Employee List */}
                    <div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 lg:mb-3">Employee Details</h3>
                      <div className="space-y-1 sm:space-y-2 max-h-30 sm:max-h-40 lg:max-h-60 overflow-y-auto">
                        {employees.map((employee) => {
                          const leaves = leaveByEmpId[employee.id] || [];
                          let isOnLeave = false;
                          
                          for (const leave of leaves) {
                            if (leave.leaveStatus.toUpperCase() !== "APPROVED") continue;
                            const start = parseDateSafe(leave.leaveStartDay);
                            const end = parseDateSafe(leave.leaveEndDay);
                            if (!start || !end) continue;
                            
                            const checkDate = new Date(selectedDate);
                            if (checkDate >= start && checkDate <= end) {
                              isOnLeave = true;
                              break;
                            }
                          }

                          const attendanceRecords = employee.attendanceList.filter(att => {
                            const attDate = parseDateSafe(att.startedAt);
                            if (!attDate) return false;
                            return toDateKeyLocal(attDate) === selectedDate;
                          });

                          let status = "Absent";
                          let statusColor = "bg-red-400";
                          
                          if (isOnLeave) {
                            status = "Leave";
                            statusColor = "bg-orange-400";
                          } else if (attendanceRecords.length > 0) {
                            const hasEnded = attendanceRecords.some(att => isAttendanceEnded(att));
                            if (hasEnded) {
                              status = "Present";
                              statusColor = "bg-green-400";
                            } else {
                              status = "In Progress";
                              statusColor = "bg-yellow-400";
                            }
                          }
                          
                          return (
                            <div key={employee.id} className="flex items-center gap-1 sm:gap-2 lg:gap-3 p-1 sm:p-2 lg:p-3 rounded-lg hover:bg-gray-50">
                              {photoUrls[employee.id] ? (
                                <img
                                  src={photoUrls[employee.id]}
                                  alt={`${employee.firstName} ${employee.lastName}`}
                                  className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-medium flex-shrink-0 text-xs sm:text-sm">
                                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">{employee.firstName} {employee.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{employee.epfNo}</p>
                              </div>
                              <span className={`px-1 sm:px-2 lg:px-3 py-1 rounded-full text-xs font-medium text-white flex-shrink-0 ${statusColor}`}>
                                <span className="hidden sm:inline">{status}</span>
                                <span className="sm:hidden">{status.charAt(0)}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyAttendanceCalendar;
