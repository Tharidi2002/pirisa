import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { attendanceService, AttendanceRowPayload } from "../../api/services/attendanceService";

const defaultStartTime = "09:00";
const defaultEndTime = "17:00";
const quickTimeOptions = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";
type WorkingStatus = "ON_SITE" | "ONLINE" | "REMOTE";

interface AttendanceRow {
  id: number;
  firstName: string;
  lastName: string;
  epfNo?: string;
  joinDate: string;
  departmentId: number;
  departmentName: string;
  attendanceDate: string;
  attendance_status: AttendanceStatus;
  working_status: WorkingStatus;
  startedAt: string;
  endedAt: string;
  entryType: string;
  createdBy: string;
  photoUrl?: string;
}

interface AttendedRow {
  empId: number;
  firstName: string;
  lastName: string;
  epfNo?: string;
  departmentId: number;
  departmentName: string;
  clockInTime: string;
  status: string;
  attendanceDate: string;
  attendanceId: number;
  photoUrl?: string;
}

interface ExcludedRow {
  id: number;
  firstName: string;
  lastName: string;
  epfNo?: string;
  joinDate: string;
  departmentId: number;
  departmentName: string;
  photoUrl?: string;
}

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const BulkAttendancePage = () => {
  const navigate = useNavigate();
  const [pendingRows, setPendingRows] = useState<AttendanceRow[]>([]);
  const [attendedRows, setAttendedRows] = useState<AttendedRow[]>([]);
  const [excludedRows, setExcludedRows] = useState<ExcludedRow[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAttended, setShowAttended] = useState<boolean>(false);
  const [showExcluded, setShowExcluded] = useState<boolean>(false);
  const [attendedDepartmentFilter, setAttendedDepartmentFilter] = useState<number>(0);
  
  // Modal state for clock-out handling
  interface ClockOutModalState {
    open: boolean;
    attendanceId?: number;
    empId?: number;
    name?: string;
    attendanceDate?: string;
    defaultEndedAt?: string; // time-only HH:mm
    reason?: string;
    notes?: string;
  }
  const [clockOutModal, setClockOutModal] = useState<ClockOutModalState>({ open: false });
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [failedPhotoLoads, setFailedPhotoLoads] = useState<Record<number, boolean>>({});

  const currentUser = localStorage.getItem("userName") || "HR Admin";
  const companyId = localStorage.getItem("cmpnyId");

  const isToday = selectedDate === getTodayDate();

  const loadBulkAttendanceData = useCallback(async () => {
    if (!companyId) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.fetchBulkAttendanceData(
        companyId,
        selectedDate,
        selectedDepartment === 0 ? undefined : selectedDepartment
      );

      const parsedPendingRows: AttendanceRow[] = data.pendingEmployees.map((employee) => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        epfNo: employee.epfNo,
        joinDate: employee.dateOfJoining ?? selectedDate,
        departmentId: employee.departmentId ?? 0,
        departmentName: employee.departmentName ?? "Unassigned",
        attendanceDate: selectedDate,
        attendance_status: "PRESENT",
        working_status: "ON_SITE",
        startedAt: defaultStartTime,
        endedAt: defaultEndTime,
        entryType: "MANUAL_HR",
        createdBy: currentUser,
        // Defer attaching the photo URL until we confirm an image exists to avoid 404 noise in the browser console.
        photoUrl: undefined,
      }));

      const parsedAttendedRows: AttendedRow[] = data.attendedEmployees.map((record) => ({
        empId: record.empId,
        firstName: record.firstName,
        lastName: record.lastName,
        epfNo: record.epfNo,
        departmentId: record.departmentId ?? 0,
        departmentName: record.departmentName ?? "Unassigned",
        clockInTime: record.clockInTime,
        status: record.status,
        attendanceDate: record.attendanceDate,
        attendanceId: record.attendanceId,
        photoUrl: undefined,
      }));

      const parsedExcludedRows: ExcludedRow[] = data.excludedEmployees.map((employee) => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        epfNo: employee.epfNo,
        joinDate: employee.dateOfJoining ?? selectedDate,
        departmentId: employee.departmentId ?? 0,
        departmentName: employee.departmentName ?? "Unassigned",
        photoUrl: undefined,
      }));

      setPendingRows(parsedPendingRows);
      setAttendedRows(parsedAttendedRows);
      setExcludedRows(parsedExcludedRows);
      setSelectedRowIds(parsedPendingRows.map((row) => row.id));

      // Attach photo URLs only for records that actually have a profile image to avoid 404 errors in console.
      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const attachPhotos = async () => {
        // Check pending rows
        await Promise.all(parsedPendingRows.map(async (r) => {
          const exists = await attendanceService.profileImageExists(r.id);
          if (exists) {
            setPendingRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, photoUrl: `${base}/api/profile-image/view/${r.id}` } : p)));
          }
        }));
        // Check attended rows
        await Promise.all(parsedAttendedRows.map(async (r) => {
          const exists = await attendanceService.profileImageExists(r.empId);
          if (exists) {
            setAttendedRows((prev) => prev.map((p) => (p.attendanceId === r.attendanceId ? { ...p, photoUrl: `${base}/api/profile-image/view/${r.empId}` } : p)));
          }
        }));
        // Check excluded rows
        await Promise.all(parsedExcludedRows.map(async (r) => {
          const exists = await attendanceService.profileImageExists(r.id);
          if (exists) {
            setExcludedRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, photoUrl: `${base}/api/profile-image/view/${r.id}` } : p)));
          }
        }));
      };

      attachPhotos().catch(() => {
        // ignore photo attachment errors; they only reduce console noise
      });

      const uniqueDepartments = Array.from(
        new Map(
          [...parsedPendingRows, ...parsedAttendedRows, ...parsedExcludedRows].map((row) => [row.departmentId, row.departmentName])
        ).entries()
      ).map(([id, name]) => ({ id, name }));

      setDepartments(uniqueDepartments.filter((dept) => dept.id !== 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [companyId, currentUser, navigate, selectedDate, selectedDepartment]);

  useEffect(() => {
    loadBulkAttendanceData();
  }, [loadBulkAttendanceData]);

  const filteredRows = useMemo(
    () => pendingRows.filter((row) => selectedDepartment === 0 || row.departmentId === selectedDepartment),
    [pendingRows, selectedDepartment]
  );

  const selectedRows = useMemo(
    () => pendingRows.filter((row) => selectedRowIds.includes(row.id)),
    [pendingRows, selectedRowIds]
  );

  const excludedEmployeeCount = useMemo(
    () => excludedRows.filter((row) => selectedDepartment === 0 || row.departmentId === selectedDepartment).length,
    [excludedRows, selectedDepartment]
  );

  const excludedByDepartment = useMemo(() => {
    return excludedRows
      .filter((row) => selectedDepartment === 0 || row.departmentId === selectedDepartment)
      .reduce<Record<string, ExcludedRow[]>>((groups, row) => {
        const key = row.departmentName || "Unassigned";
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(row);
        return groups;
      }, {});
  }, [excludedRows, selectedDepartment]);

  // Filter attended rows by an optional department filter selected in the attended panel.
  // If attendedDepartmentFilter is 0, show all attended rows; otherwise only rows matching dept id.
  const attendedFilteredRows = useMemo(() => {
    return attendedRows.filter((r) => attendedDepartmentFilter === 0 || r.departmentId === attendedDepartmentFilter);
  }, [attendedRows, attendedDepartmentFilter]);

  const allFilteredSelected = useMemo(
    () => filteredRows.length > 0 && filteredRows.every((row) => selectedRowIds.includes(row.id)),
    [filteredRows, selectedRowIds]
  );

  const minJoinDate = useMemo(() => {
    const companyRows = [...pendingRows, ...excludedRows].filter((row) => selectedDepartment === 0 || row.departmentId === selectedDepartment);
    const dates = companyRows.map((row) => row.joinDate).filter(Boolean);
    return dates.length > 0 ? dates.reduce((min, current) => (current < min ? current : min)) : selectedDate;
  }, [pendingRows, excludedRows, selectedDepartment, selectedDate]);

  const todayAttendanceNote = isToday
    ? "Today's attendance entry is intended for current arrivals only. Already marked attendees are shown below and cannot be duplicated here. If someone leaves early, record the actual attendance and time; no extra reason needs to be added in this form."
    : "Select the date and department, then mark attendance for the chosen day.";

  const handleRowChange = (id: number, next: Partial<AttendanceRow>) => {
    setPendingRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, ...next } : row)));
  };

  const toggleRowSelection = (id: number) => {
    setSelectedRowIds((prevIds) =>
      prevIds.includes(id) ? prevIds.filter((rowId) => rowId !== id) : [...prevIds, id]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedRowIds((prevIds) => prevIds.filter((id) => !filteredRows.some((row) => row.id === id)));
    } else {
      setSelectedRowIds((prevIds) => [
        ...new Set([...prevIds, ...filteredRows.map((row) => row.id)]),
      ]);
    }
  };

  const handlePhotoError = (id: number) => {
    setFailedPhotoLoads((prev) => ({ ...prev, [id]: true }));
  };

  const buildPayload = (): AttendanceRowPayload[] => {
    return selectedRows.map((row) => {
      const startedAt = row.attendance_status === "PRESENT" ? `${row.attendanceDate}T${row.startedAt}:00` : null;
      const endedAt = !isToday && row.attendance_status === "PRESENT" ? `${row.attendanceDate}T${row.endedAt}:00` : null;
      return {
        empId: row.id,
        attendanceDate: row.attendanceDate,
        startedAt,
        endedAt,
        working_status: row.working_status,
        attendance_status: row.attendance_status,
        entryType: row.entryType,
        createdBy: row.createdBy,
      };
    });
  };

  const handleSaveAttendance = async () => {
    if (!companyId) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = buildPayload();
      if (payload.length === 0) {
        setError("No selected employees to save.");
        return;
      }

      await attendanceService.bulkMarkAttendance(payload);
      setSuccessMessage("Attendance saved successfully.");
      await loadBulkAttendanceData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  // Handler to open the clock-out modal for a specific attended record.
  // Pre-fills the modal with the employee name and a default end time (current time in HH:mm).
  const openClockOutModal = (record: AttendedRow) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setClockOutModal({
      open: true,
      attendanceId: record.attendanceId,
      empId: record.empId,
      name: `${record.firstName} ${record.lastName}`,
      attendanceDate: record.attendanceDate,
      defaultEndedAt: `${hh}:${mm}`,
      reason: "Standard Off-Time",
      notes: "",
    });
  };

  // Confirm clock-out: call backend endpoint and refresh bulk attendance data.
  // This enforces that early departures are recorded with a reason and optional notes.
  const confirmClockOut = async () => {
    if (!clockOutModal.attendanceId) return;
    setSaving(true);
    try {
      // Build payload: if only time provided, backend will combine with attendanceDate.
      const payload = {
        endedAt: clockOutModal.defaultEndedAt, // backend accepts HH:mm or full datetime
        departureReason: clockOutModal.reason,
        departureNotes: clockOutModal.notes,
      };
      await attendanceService.clockOut(clockOutModal.attendanceId, payload);
      setSuccessMessage("Clock-out recorded successfully.");
      setClockOutModal({ open: false });
      await loadBulkAttendanceData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clock out employee.");
    } finally {
      setSaving(false);
    }
  };

  const closeClockOutModal = () => setClockOutModal({ open: false });

  const statusOptions: { value: AttendanceStatus; label: string }[] = [
    { value: "PRESENT", label: "Present" },
    { value: "ABSENT", label: "Absent" },
    { value: "LEAVE", label: "Leave" },
  ];

  const workingStatusOptions: { value: WorkingStatus; label: string }[] = [
    { value: "ON_SITE", label: "On-site" },
    { value: "ONLINE", label: "Online" },
    { value: "REMOTE", label: "Remote" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Bulk Attendance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Prepare and save attendance for the selected department and date.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Attendance Date
              <input
                type="date"
                min={minJoinDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Department
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(Number(e.target.value))}
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value={0}>All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}
        {excludedEmployeeCount > 0 && (
          <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-2 font-medium">
                  <span>⚠️</span>
                  <span>{excludedEmployeeCount} employee{excludedEmployeeCount === 1 ? "" : "s"} were removed because their join date is after the selected attendance date.</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowExcluded((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 hover:bg-yellow-200"
              >
                {showExcluded ? "Hide details" : "Show details"}
              </button>
            </div>
            {showExcluded && (
              <div className="mt-3 space-y-4">
                {Object.entries(excludedByDepartment).map(([departmentName, rows]) => (
                  <div key={departmentName} className="rounded-md bg-yellow-100 border border-yellow-200 p-3">
                    <div className="text-sm font-semibold text-yellow-900">{departmentName}</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-yellow-900">
                      {rows.map((row) => (
                        <li key={row.id}>
                          {row.firstName} {row.lastName} {row.epfNo ? `(${row.epfNo})` : ""} - Join date: {row.joinDate}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clock Out Modal - simple accessible modal overlay used to capture end time, reason and notes for early departures. */}
      {clockOutModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">Clock Out - {clockOutModal.name}</h3>
              <button onClick={closeClockOutModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="text-sm text-gray-600">Attendance Date: <span className="font-medium">{clockOutModal.attendanceDate}</span></div>
              <label className="block text-sm">
                End Time
                <input
                  type="time"
                  value={clockOutModal.defaultEndedAt || ""}
                  onChange={(e) => setClockOutModal((s) => ({ ...s, defaultEndedAt: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                Reason for Early/Standard Departure
                <select
                  value={clockOutModal.reason || ""}
                  onChange={(e) => setClockOutModal((s) => ({ ...s, reason: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                >
                  <option>Standard Off-Time</option>
                  <option>Personal Reason</option>
                  <option>Medical Emergency</option>
                  <option>Official Field Work</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block text-sm">
                Notes / Remarks (optional)
                <textarea
                  value={clockOutModal.notes || ""}
                  onChange={(e) => setClockOutModal((s) => ({ ...s, notes: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-2 text-sm"
                  rows={3}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeClockOutModal} className="rounded-md bg-gray-100 px-4 py-2 text-sm">Cancel</button>
              <button onClick={confirmClockOut} disabled={saving} className="rounded-md bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-60">
                {saving ? "Saving..." : "Confirm Clock Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sky-800">
        <div className="font-semibold">{isToday ? "Today’s Attendance Guidance" : "Attendance Guidance"}</div>
        <div className="mt-2 text-sm leading-6">{todayAttendanceNote}</div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Working Mode
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Start Time
              </th>
              {!isToday && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End Time
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.includes(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="inline-flex items-center gap-3">
                    {row.photoUrl && !failedPhotoLoads[row.id] ? (
                      <img
                        src={row.photoUrl}
                        alt={`${row.firstName} ${row.lastName}`}
                        onError={() => handlePhotoError(row.id)}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                        {row.firstName?.charAt(0) || "?"}{row.lastName?.charAt(0) || ""}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
                      <div className="text-xs text-gray-500">{row.epfNo || "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.departmentName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <select
                    value={row.attendance_status}
                    onChange={(e) =>
                      handleRowChange(row.id, {
                        attendance_status: e.target.value as AttendanceStatus,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <select
                    value={row.working_status}
                    onChange={(e) => handleRowChange(row.id, { working_status: e.target.value as WorkingStatus })}
                    disabled={row.attendance_status !== "PRESENT"}
                    className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    {workingStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="time"
                      step="900"
                      value={row.startedAt}
                      onChange={(e) => handleRowChange(row.id, { startedAt: e.target.value })}
                      disabled={row.attendance_status !== "PRESENT"}
                      className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                    <select
                      value={row.startedAt}
                      onChange={(e) => handleRowChange(row.id, { startedAt: e.target.value })}
                      disabled={row.attendance_status !== "PRESENT"}
                      className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">Quick select</option>
                      {quickTimeOptions.map((timeOption) => (
                        <option key={timeOption} value={timeOption}>
                          {timeOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                {!isToday && (
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <input
                      type="time"
                      step="900"
                      value={row.endedAt}
                      onChange={(e) => handleRowChange(row.id, { endedAt: e.target.value })}
                      disabled={row.attendance_status !== "PRESENT"}
                      className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Already Attended Employees</h2>
            <p className="text-sm text-gray-600 mt-1">These employees already have a record for {isToday ? "today" : selectedDate}.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">
              Department
              <select
                value={attendedDepartmentFilter}
                onChange={(e) => setAttendedDepartmentFilter(Number(e.target.value))}
                className="ml-2 rounded-md border border-gray-300 px-2 py-1 text-sm"
              >
                <option value={0}>All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setShowAttended((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              {showAttended ? "Hide attended" : "Show attended"}
            </button>
          </div>
        </div>
        {showAttended && (
          <div className="mt-4 overflow-x-auto">
            {attendedRows.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Clock-In Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendedFilteredRows.map((record) => (
                    <tr key={record.attendanceId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{record.empId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{`${record.firstName} ${record.lastName}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.departmentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.clockInTime || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.status}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <button
                          type="button"
                          onClick={() => openClockOutModal(record)}
                          className="rounded-md border border-amber-500 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50"
                        >
                          Clock Out
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                No already attended employees found for this date.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          {selectedRowIds.length} selected of {filteredRows.length} employee{filteredRows.length === 1 ? "" : "s"} shown.
        </div>
        <button
          type="button"
          onClick={handleSaveAttendance}
          disabled={saving || loading || selectedRowIds.length === 0}
          className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          title={selectedRowIds.length === 0 ? "Select at least one employee to save attendance" : "Save selected attendance records"}
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default BulkAttendancePage;
