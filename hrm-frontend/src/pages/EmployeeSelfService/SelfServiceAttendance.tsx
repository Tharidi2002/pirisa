import React, { useEffect, useMemo, useState } from "react";
import { FaClock, FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { selfServiceApi, AttendanceRecord } from "../../api/services/selfServiceApi";

const SelfServiceAttendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const employeeId = parseInt(localStorage.getItem("empId") || "0");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await selfServiceApi.getMyAttendance(employeeId, month, year);
        setRecords(data);
      } catch {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetch();
  }, [employeeId, month, year]);

  const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const attendanceByDate = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    records.forEach((r) => {
      if (r.attendanceDate) {
        const key = String(r.attendanceDate).split("T")[0];
        map[key] = r;
      }
    });
    return map;
  }, [records]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; inMonth: boolean; key: string }[] = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, -i);
      days.push({ date: d, inMonth: false, key: toDateKey(d) });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      days.push({ date: d, inMonth: true, key: toDateKey(d) });
    }
    while (days.length < 42) {
      const last = days[days.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      days.push({ date: next, inMonth: false, key: toDateKey(next) });
    }
    return days;
  }, [year, month]);

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const stats = useMemo(() => {
    const present = records.filter((r) =>
      r.attendanceStatus?.toUpperCase().includes("PRESENT")
    ).length;
    const absent = records.filter((r) =>
      r.attendanceStatus?.toUpperCase().includes("ABSENT")
    ).length;
    const leave = records.filter((r) =>
      r.attendanceStatus?.toUpperCase().includes("LEAVE")
    ).length;
    const totalHours = records.reduce((sum, r) => sum + (r.totalTime || 0) / 60, 0);
    return { present, absent, leave, totalHours, total: records.length };
  }, [records]);

  const goPrev = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const goNext = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const goToday = () => setCurrentDate(new Date());

  const getDayClass = (key: string, inMonth: boolean) => {
    if (!inMonth) return "text-gray-300 bg-gray-50";
    const record = attendanceByDate[key];
    if (!record) return "bg-white text-gray-700";
    const status = (record.attendanceStatus || "").toUpperCase();
    if (status.includes("PRESENT")) return "bg-green-100 text-green-800 border-green-300";
    if (status.includes("ABSENT")) return "bg-red-100 text-red-800 border-red-300";
    if (status.includes("LEAVE")) return "bg-orange-100 text-orange-800 border-orange-300";
    if (status.includes("HALF")) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-white text-gray-700";
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading attendance..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaClock className="text-purple-500" /> My Attendance
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="p-2 rounded-lg hover:bg-gray-100">
              <FaChevronLeft />
            </button>
            <div className="text-lg font-semibold text-gray-700 min-w-[180px] text-center">
              {monthName}
            </div>
            <button onClick={goNext} className="p-2 rounded-lg hover:bg-gray-100">
              <FaChevronRight />
            </button>
            <button
              onClick={goToday}
              className="ml-2 px-3 py-2 text-sm rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-2xl font-bold text-gray-800">{stats.absent}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Leave</p>
          <p className="text-2xl font-bold text-gray-800">{stats.leave}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalHours.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const record = attendanceByDate[day.key];
            return (
              <div
                key={day.key}
                title={record ? `${record.attendanceStatus} - ${(record.totalTime / 60).toFixed(1)}h` : ""}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-sm transition-all hover:shadow-md ${getDayClass(day.key, day.inMonth)}`}
              >
                <span className="font-semibold">{day.date.getDate()}</span>
                {record && day.inMonth && (
                  <span className="text-xs">{(record.totalTime / 60).toFixed(1)}h</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-green-400"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-red-400"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-orange-400"></div>
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-yellow-400"></div>
            <span>Half Day</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-purple-500" /> Recent Records
        </h2>
        {records.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {records.slice(0, 20).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-800">{r.attendanceDate}</p>
                  <p className="text-xs text-gray-500">{r.dayName} • {r.workingStatus}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${r.attendanceStatus?.includes("PRESENT") ? "text-green-600" : "text-gray-600"}`}>
                    {r.attendanceStatus}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.startedAt ? r.startedAt.substring(11, 16) : "--"} - {r.endedAt ? r.endedAt.substring(11, 16) : "--"}
                    {" • "}{(r.totalTime / 60).toFixed(1)}h
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No records for this month</p>
        )}
      </div>
    </div>
  );
};

export default SelfServiceAttendance;