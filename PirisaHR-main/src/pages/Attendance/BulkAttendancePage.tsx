import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { attendanceService, AttendanceRowPayload } from "../../api/services/attendanceService";

const defaultStartTime = "09:00";
const defaultEndTime = "17:00";

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
}

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const BulkAttendancePage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showExcluded, setShowExcluded] = useState<boolean>(false);

  const currentUser = localStorage.getItem("userName") || "HR Admin";
  const companyId = localStorage.getItem("cmpnyId");

  const loadEmployees = useCallback(async () => {
    if (!companyId) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const employees = await attendanceService.fetchEmployeesByCompany(companyId);
      const parsedRows: AttendanceRow[] = employees.map((employee) => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        epfNo: employee.epfNo,
        joinDate: employee.dateOfJoining ?? selectedDate,
        departmentId: employee.department?.id ?? 0,
        departmentName: employee.department?.dpt_name ?? "Unassigned",
        attendanceDate: selectedDate,
        attendance_status: "PRESENT",
        working_status: "ON_SITE",
        startedAt: defaultStartTime,
        endedAt: defaultEndTime,
        entryType: "MANUAL_HR",
        createdBy: currentUser,
      }));

      setRows(parsedRows);
      const uniqueDepartments = Array.from(
        new Map(
          parsedRows.map((row) => [row.departmentId, row.departmentName])
        ).entries()
      ).map(([id, name]) => ({ id, name }));
      setDepartments(uniqueDepartments.filter((dept) => dept.id !== 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [companyId, currentUser, navigate]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        attendanceDate: selectedDate,
        startedAt: row.startedAt || defaultStartTime,
        endedAt: row.endedAt || defaultEndTime,
      }))
    );
  }, [selectedDate]);

  const filteredRows = useMemo(() => {
    const selectedRows = rows.filter((row) => selectedDepartment === 0 || row.departmentId === selectedDepartment);
    return selectedRows.filter((row) => row.joinDate <= selectedDate);
  }, [rows, selectedDepartment, selectedDate]);

  const excludedRows = useMemo(
    () =>
      rows.filter(
        (row) => (selectedDepartment === 0 || row.departmentId === selectedDepartment) && row.joinDate > selectedDate
      ),
    [rows, selectedDepartment, selectedDate]
  );

  const excludedEmployeeCount = excludedRows.length;

  const excludedByDepartment = useMemo(() => {
    return excludedRows.reduce<Record<string, AttendanceRow[]>>((groups, row) => {
      const key = row.departmentName || "Unassigned";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
      return groups;
    }, {});
  }, [excludedRows]);

  const minJoinDate = useMemo(() => {
    const companyRows = rows.filter((row) => selectedDepartment === 0 || row.departmentId === selectedDepartment);
    const dates = companyRows.map((row) => row.joinDate).filter(Boolean);
    return dates.length > 0 ? dates.reduce((min, current) => (current < min ? current : min)) : selectedDate;
  }, [rows, selectedDepartment]);

  const handleRowChange = (id: number, next: Partial<AttendanceRow>) => {
    setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, ...next } : row)));
  };

  const buildPayload = (): AttendanceRowPayload[] => {
    return filteredRows.map((row) => {
      const startedAt = row.attendance_status === "PRESENT" ? `${row.attendanceDate}T${row.startedAt}:00` : null;
      const endedAt = row.attendance_status === "PRESENT" ? `${row.attendanceDate}T${row.endedAt}:00` : null;
      return {
        empId: row.id,
        attendanceDate: row.attendanceDate,
        startedAt,
        endedAt,
        working_status:
          row.attendance_status === "PRESENT"
            ? row.working_status
            : row.attendance_status,
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
        setError("No employees selected for attendance.");
        return;
      }

      await attendanceService.bulkMarkAttendance(payload);
      setSuccessMessage("Attendance saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

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

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                End Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
                  <div className="text-xs text-gray-500">{row.epfNo || "-"}</div>
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
                  <input
                    type="time"
                    value={row.startedAt}
                    onChange={(e) => handleRowChange(row.id, { startedAt: e.target.value })}
                    disabled={row.attendance_status !== "PRESENT"}
                    className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input
                    type="time"
                    value={row.endedAt}
                    onChange={(e) => handleRowChange(row.id, { endedAt: e.target.value })}
                    disabled={row.attendance_status !== "PRESENT"}
                    className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          {filteredRows.length} employee{filteredRows.length === 1 ? "" : "s"} ready for attendance.
        </div>
        <button
          type="button"
          onClick={handleSaveAttendance}
          disabled={saving || loading}
          className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default BulkAttendancePage;
