import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  id: number;
  startedAt: string;
  endedAt: string;
  empId: number;
  working_status: string;
  totalTime: number;
  attendance_status: string | null;
  dayName: string;
  additional_attendance: string | null;
}

interface Leave {
  id: number;
  leaveType: string;
  leaveReason: string;
  leaveStatus: string;
  leaveStartDay: string;
  leaveEndDay: string;
  leaveDays: number;
}

interface Employee {
  id: number;
  epf_no: string;
  emp_no: string;
  first_name: string;
  last_name: string;
  basic_salary: number;
  email: string;
  username: string;
  gender: string;
  phone: string;
  address: string;
  date_of_joining: string;
  status: string;
  role: string;
  cmpId: number;
  dptId: number;
  designationId: number;
  attendanceList: AttendanceRecord[];
  payroleList: unknown[];
}

interface ApiResponse {
  resultCode: number;
  Employee_list: Employee;
}

interface EmployeeDetailsResponse {
  EmployeeLeaveList: Array<{
    leaveList: Leave[];
  }>;
  resultCode: number;
  resultDesc: string;
}

const AttendanceCalendarDashboard: React.FC = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const empId = localStorage.getItem("empId");

        if (!empId || !token) {
          throw new Error("Employee ID or token not found");
        }

        // Fetch employee data
        const employeeResponse = await fetch(
          `http://localhost:8080/employee/emp/${empId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch leave data
        const leaveResponse = await fetch(
          `http://localhost:8080/employee/EmpDetailsListByEmp/${empId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!employeeResponse.ok || !leaveResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const employeeData: ApiResponse = await employeeResponse.json();
        const leaveData: EmployeeDetailsResponse = await leaveResponse.json();

        if (employeeData.resultCode === 100 && leaveData.resultCode === 100) {
          setEmployee(employeeData.Employee_list);
          setLeaves(leaveData.EmployeeLeaveList[0]?.leaveList || []);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAttendanceForDate = (date: Date): AttendanceRecord | null => {
    if (!employee) return null;

    return (
      employee.attendanceList.find((attendance) => {
        const attendanceDate = new Date(attendance.startedAt);
        return attendanceDate.toDateString() === date.toDateString();
      }) || null
    );
  };

  const getLeaveForDate = (date: Date): Leave | null => {
    const dateString = date.toISOString().split("T")[0];
    return (
      leaves.find((leave) => {
        const startDate = new Date(leave.leaveStartDay)
          .toISOString()
          .split("T")[0];
        const endDate = new Date(leave.leaveEndDay).toISOString().split("T")[0];
        return (
          dateString >= startDate &&
          dateString <= endDate &&
          leave.leaveStatus === "APPROVED"
        );
      }) || null
    );
  };

  const getDayStatus = (date: Date): { className: string; label: string } => {
    const attendance = getAttendanceForDate(date);
    const leave = getLeaveForDate(date);

    if (leave) {
      return {
        className: "bg-red-100 text-red-800 border-red-200",
        label: leave.leaveType,
      };
    }

    if (attendance) {
      switch (attendance.working_status) {
        case "On-Site":
          return {
            className: "bg-green-100 text-green-800 border-green-200",
            label: "On-Site",
          };
        case "Online":
          return {
            className: "bg-blue-100 text-blue-800 border-blue-200",
            label: "Online",
          };
        case "Hybrid":
          return {
            className: "bg-purple-100 text-purple-800 border-purple-200",
            label: "Hybrid",
          };
        default:
          return {
            className: "bg-yellow-100 text-yellow-800 border-yellow-200",
            label: attendance.working_status,
          };
      }
    }

    return {
      className: "bg-gray-100 text-gray-400 border-gray-200",
      label: "No Record",
    };
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const daysInMonth = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Attendance Calendar
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h3 className="text-lg font-medium">{monthName}</h3>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((date) => {
                  const { className, label } = getDayStatus(date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  const isSelected =
                    selectedDate?.toDateString() === date.toDateString();
                  const attendance = getAttendanceForDate(date);
                  const leave = getLeaveForDate(date);

                  return (
                    <div
                      key={date.getTime()}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-200 min-h-[60px]
                        ${isToday ? "ring-2 ring-blue-500" : ""}
                        ${
                          isSelected
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50"
                        }
                        ${className}
                        border
                      `}
                    >
                      <div className="text-sm font-medium">
                        {date.getDate()}
                      </div>
                      <div className="mt-1">
                        <div className="text-xs font-medium">{label}</div>
                        {attendance && !leave && (
                          <div className="text-xs opacity-75">
                            {formatTime(attendance.totalTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Days Present</span>
                  <span className="font-medium">
                    {employee.attendanceList.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Hours</span>
                  <span className="font-medium">
                    {formatTime(
                      employee.attendanceList.reduce(
                        (sum, att) => sum + att.totalTime,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">On-Site Days</span>
                  <span className="font-medium">
                    {
                      employee.attendanceList.filter(
                        (att) => att.working_status === "On-Site"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online Days</span>
                  <span className="font-medium">
                    {
                      employee.attendanceList.filter(
                        (att) => att.working_status === "Online"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved Leaves</span>
                  <span className="font-medium">
                    {
                      leaves.filter((leave) => leave.leaveStatus === "APPROVED")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Day Details */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                {(() => {
                  const dayAttendance = getAttendanceForDate(selectedDate);
                  const dayLeave = getLeaveForDate(selectedDate);

                  if (dayLeave) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            {dayLeave.leaveType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            Status:{" "}
                            <span className="font-medium">
                              {dayLeave.leaveStatus}
                            </span>
                          </p>
                          <p>Reason: {dayLeave.leaveReason}</p>
                          <p>Duration: {dayLeave.leaveDays} day(s)</p>
                          <p>From: {formatDateTime(dayLeave.leaveStartDay)}</p>
                          <p>To: {formatDateTime(dayLeave.leaveEndDay)}</p>
                        </div>
                      </div>
                    );
                  }

                  if (dayAttendance) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {dayAttendance.working_status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {formatTime(dayAttendance.totalTime)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            Start: {formatDateTime(dayAttendance.startedAt)}
                          </p>
                          <p>End: {formatDateTime(dayAttendance.endedAt)}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p className="text-gray-500 text-sm">
                      No record for this day
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {employee.attendanceList.slice(0, 3).map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        attendance.working_status === "On-Site"
                          ? "bg-green-500"
                          : attendance.working_status === "Remote"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {attendance.dayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(attendance.startedAt)} •{" "}
                        {formatTime(attendance.totalTime)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {attendance.working_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendarDashboard;
