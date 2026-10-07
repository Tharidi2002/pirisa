import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { User } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { attendanceService, type EmployeeLeaveDTO } from "../../api/services/attendanceService";
import type {
  AttendedEmployeeDTO,
  AttendanceDepartmentDTO,
  AttendanceRowPayload,
  EmployeeDetailsDTO,
  PendingEmployeeDTO,
} from "../../api/services/attendanceService";
import { axiosInstance } from "../../api/config/axios";

type AttendanceStatus = "OFFICE" | "WFH" | "HALF_DAY" | "ABSENT";
type HalfDayType = "MORNING" | "AFTERNOON";

type DirectoryEmployee = {
  id: number;
  epfNo?: string;
  firstName: string;
  lastName: string;
  departmentId?: number;
  departmentName?: string;
};

type LeaveEmployee = DirectoryEmployee & Omit<EmployeeLeaveDTO, "id"> & {
  leaveRecordId: number;
};

const todayIso = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const employeeName = (employee: DirectoryEmployee) =>
  [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
  "Unknown employee";

const departmentName = (employee: DirectoryEmployee) =>
  employee.departmentName || "Unassigned";

const toDirectoryEmployee = (employee: EmployeeDetailsDTO): DirectoryEmployee => ({
  id: employee.id,
  epfNo: employee.epfNo,
  firstName: employee.firstName,
  lastName: employee.lastName,
  departmentId: employee.department?.id,
  departmentName: employee.department?.dpt_name,
});

const toPendingEmployee = (employee: PendingEmployeeDTO): DirectoryEmployee => ({
  id: employee.id,
  epfNo: employee.epfNo,
  firstName: employee.firstName,
  lastName: employee.lastName,
  departmentId: employee.departmentId,
  departmentName: employee.departmentName,
});

const statusLabel = (
  status: AttendanceStatus,
  halfDayType?: HalfDayType,
) => {
  if (status === "OFFICE") return "Office";
  if (status === "WFH") return "Work From Home";
  if (status === "HALF_DAY") {
    return `Half Day (${halfDayType === "MORNING" ? "AM" : "PM"})`;
  }
  return "Absent";
};

const statusBadge = (employee: AttendedEmployeeDTO) => {
  const attendanceStatus = employee.status.toUpperCase();
  let status: AttendanceStatus = "OFFICE";
  if (attendanceStatus === "ABSENT") status = "ABSENT";
  else if (attendanceStatus === "HALF_DAY") status = "HALF_DAY";
  else if (employee.workingStatus.toUpperCase() === "WFH") status = "WFH";

  const colors: Record<AttendanceStatus, string> = {
    OFFICE: "bg-blue-100 text-blue-800",
    WFH: "bg-purple-100 text-purple-800",
    HALF_DAY: "bg-orange-100 text-orange-800",
    ABSENT: "bg-red-100 text-red-800",
  };
  const icon: Record<AttendanceStatus, string> = {
    OFFICE: "🏢",
    WFH: "🏠",
    HALF_DAY: "⏰",
    ABSENT: "❌",
  };
  const halfDayType = employee.halfDayType as HalfDayType | undefined;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}
    >
      {icon[status]} {statusLabel(status, halfDayType)}
    </span>
  );
};

const markedAtLabel = (time: string) => {
  if (!time) return "—";
  const [hoursText, minutesText] = time.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const matchesSearch = (employee: DirectoryEmployee, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [
    employeeName(employee),
    employee.epfNo ?? "",
    String(employee.id),
    departmentName(employee),
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
};

type SectionCardProps = {
  title: string;
  count: number;
  search: string;
  onSearchChange: (value: string) => void;
  children: ReactNode;
};

const SectionCard = ({
  title,
  count,
  search,
  onSearchChange,
  children,
}: SectionCardProps) => (
  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4">
      <h3 className="text-base font-semibold text-slate-800">
        {title} <span className="text-slate-500">({count})</span>
      </h3>
      <input
        type="search"
        aria-label={`Search ${title}`}
        placeholder="Search name, ID, department"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-72"
      />
    </header>
    {children}
  </section>
);

type EmployeeCellsProps = {
  employee: DirectoryEmployee;
  photoUrl?: string;
};

const EmployeeCells = ({ employee, photoUrl }: EmployeeCellsProps) => (
  <>
    <td className="px-4 py-3">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${employeeName(employee)} profile`}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
          aria-label="No employee photo"
        >
          <User size={17} className="text-slate-500" />
        </div>
      )}
    </td>
    <td className="px-4 py-3 font-medium text-slate-800">{employeeName(employee)}</td>
    <td className="px-4 py-3 text-slate-600">{employee.epfNo || employee.id}</td>
    <td className="px-4 py-3 text-slate-600">{departmentName(employee)}</td>
  </>
);

const tableHeadClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";
const rowClass =
  "border-t border-slate-100 text-sm transition-colors duration-200 hover:bg-slate-50";

const AttendanceMarkTable = () => {
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployeeDTO[]>([]);
  const [markedEmployees, setMarkedEmployees] = useState<AttendedEmployeeDTO[]>([]);
  const [directory, setDirectory] = useState<DirectoryEmployee[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<EmployeeLeaveDTO[]>([]);
  const [departments, setDepartments] = useState<AttendanceDepartmentDTO[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [pendingStatuses, setPendingStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [pendingHalfDays, setPendingHalfDays] = useState<Record<number, HalfDayType>>({});
  const [editingAttendanceId, setEditingAttendanceId] = useState<number | null>(null);
  const [editedStatuses, setEditedStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [editedHalfDays, setEditedHalfDays] = useState<Record<number, HalfDayType>>({});
  const [offTimeEmployee, setOffTimeEmployee] = useState<AttendedEmployeeDTO | null>(null);
  const [offTimeValue, setOffTimeValue] = useState("");
  const [leaveToCancel, setLeaveToCancel] = useState<LeaveEmployee | null>(null);
  const [cancellationReason, setCancellationReason] = useState("Employee came to office");
  const [busyEmployeeId, setBusyEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSearch, setPendingSearch] = useState("");
  const [markedSearch, setMarkedSearch] = useState("");
  const [offTodaySearch, setOffTodaySearch] = useState("");
  const [absentSearch, setAbsentSearch] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");

  const companyId = localStorage.getItem("cmpnyId");
  const attendanceDate = todayIso();

  const loadPhotos = useCallback(async (employees: DirectoryEmployee[]) => {
    const photoEntries = await Promise.all(
      employees.map(async (employee): Promise<[number, string] | null> => {
        try {
          const exists = await axiosInstance.get<{ hasProfileImage?: boolean; exists?: boolean }>(
            `/api/profile-image/exists/${employee.id}`,
          );
          if (!(exists.data.hasProfileImage ?? exists.data.exists)) return null;
          const image = await axiosInstance.get<Blob>(
            `/api/profile-image/view/${employee.id}`,
            { responseType: "blob" },
          );
          return image.data.size > 0
            ? [employee.id, URL.createObjectURL(image.data)]
            : null;
        } catch (loadError) {
          console.error(`Failed to load employee photo ${employee.id}:`, loadError);
          return null;
        }
      }),
    );
    const nextPhotos = Object.fromEntries(
      photoEntries.filter((entry): entry is [number, string] => entry !== null),
    );
    setPhotoUrls((previous) => {
      Object.values(previous).forEach((url) => URL.revokeObjectURL(url));
      return nextPhotos;
    });
  }, []);

  const loadBoard = useCallback(async (showLoading = true) => {
    if (!companyId) {
      setError("Company information is missing. Please log in again.");
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [pending, marked, leaves, employees, loadedDepartments] =
        await Promise.all([
          attendanceService.fetchPendingAttendance(companyId, attendanceDate),
          attendanceService.fetchMarkedAttendance(companyId, attendanceDate),
          attendanceService.fetchEmployeesOnLeave(companyId, attendanceDate),
          attendanceService.fetchEmployeesByCompany(companyId),
          attendanceService.fetchDepartments(companyId),
        ]);
      const employeeDirectory = employees.map(toDirectoryEmployee);
      setPendingEmployees(pending);
      setMarkedEmployees(marked);
      setLeaveRecords(leaves);
      setDirectory(employeeDirectory);
      setDepartments(loadedDepartments);
      void loadPhotos(employeeDirectory);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load attendance.",
      );
    } finally {
      setLoading(false);
    }
  }, [attendanceDate, companyId, loadPhotos]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useEffect(
    () => () => Object.values(photoUrls).forEach((url) => URL.revokeObjectURL(url)),
    [photoUrls],
  );

  const departmentMatches = useCallback(
    (employee: DirectoryEmployee) =>
      selectedDepartment === 0 || employee.departmentId === selectedDepartment,
    [selectedDepartment],
  );

  const pendingInDepartment = useMemo(
    () =>
      pendingEmployees
        .map(toPendingEmployee)
        .filter(departmentMatches)
        .filter((employee) => !leaveRecords.some((leave) => leave.empId === employee.id)),
    [leaveRecords, pendingEmployees, departmentMatches],
  );
  const markedInDepartment = useMemo(
    () => markedEmployees.filter((employee) => departmentMatches({
      id: employee.empId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      epfNo: employee.epfNo,
      departmentId: employee.departmentId,
      departmentName: employee.departmentName,
    })),
    [markedEmployees, departmentMatches],
  );
  const onLeaveEmployeeIds = useMemo(
    () => new Set(leaveRecords.map((leave) => leave.empId)),
    [leaveRecords],
  );
  const absentInDepartment = useMemo(
    () =>
      markedInDepartment.filter(
        (employee) =>
          employee.status.trim().toUpperCase() === "ABSENT" &&
          !onLeaveEmployeeIds.has(employee.empId),
      ),
    [markedInDepartment, onLeaveEmployeeIds],
  );
  const eligibleWorkingEmployees = useMemo(
    () =>
      markedInDepartment.filter(
        (employee) =>
          employee.status.trim().toUpperCase() !== "ABSENT" &&
          employee.status.trim().toUpperCase() !== "LEAVE" &&
          !onLeaveEmployeeIds.has(employee.empId),
      ),
    [markedInDepartment, onLeaveEmployeeIds],
  );
  const workingInDepartment = useMemo(
    () =>
      eligibleWorkingEmployees.filter(
        (employee) => !employee.clockOutTime?.trim(),
      ),
    [eligibleWorkingEmployees],
  );
  const offTodayEmployees = useMemo(
    () =>
      eligibleWorkingEmployees.filter((employee) =>
        Boolean(employee.clockOutTime?.trim()),
      ),
    [eligibleWorkingEmployees],
  );

  const employeesById = useMemo(
    () => new Map(directory.map((employee) => [employee.id, employee])),
    [directory],
  );
  const onLeaveEmployees = useMemo(
    () =>
      leaveRecords.flatMap((leave) => {
        const employee = employeesById.get(leave.empId);
        return employee && departmentMatches(employee)
          ? [{ ...leave, ...employee, leaveRecordId: leave.id }]
          : [];
      }),
    [departmentMatches, employeesById, leaveRecords],
  );

  const filteredPending = pendingInDepartment.filter((employee) =>
    matchesSearch(employee, pendingSearch),
  );
  const filteredWorking = workingInDepartment.filter((employee) =>
    matchesSearch({
      id: employee.empId,
      epfNo: employee.epfNo,
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentName: employee.departmentName,
    }, markedSearch),
  );
  const filteredAbsent = absentInDepartment.filter((employee) =>
    matchesSearch({
      id: employee.empId,
      epfNo: employee.epfNo,
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentName: employee.departmentName,
    }, absentSearch),
  );
  const filteredOffToday = offTodayEmployees.filter((employee) =>
    matchesSearch(
      {
        id: employee.empId,
        epfNo: employee.epfNo,
        firstName: employee.firstName,
        lastName: employee.lastName,
        departmentName: employee.departmentName,
      },
      offTodaySearch,
    ),
  );
  const filteredOnLeave = onLeaveEmployees.filter((employee) =>
    matchesSearch(employee, leaveSearch),
  );

  const markAttendance = async (employee: DirectoryEmployee) => {
    const status = pendingStatuses[employee.id] || "OFFICE";
    const halfDayType = pendingHalfDays[employee.id] || "MORNING";
    setBusyEmployeeId(employee.id);
    try {
      const attendance: AttendanceRowPayload = {
        empId: employee.id,
        attendanceDate,
        startedAt: null,
        endedAt: null,
        working_status: status === "WFH" ? "WFH" : "OFFICE",
        attendance_status:
          status === "ABSENT" ? "ABSENT" : status === "HALF_DAY" ? "HALF_DAY" : "PRESENT",
        ...(status === "HALF_DAY" ? { halfDayType } : {}),
        entryType: "MANUAL_HR",
        createdBy: localStorage.getItem("userName") || "HR Admin",
      };
      await attendanceService.bulkMarkAttendance([attendance]);
      await loadBoard(false);
      toast.success(`${employeeName(employee)} marked as ${statusLabel(status, halfDayType)} ✅`);
    } catch (markError) {
      toast.error(markError instanceof Error ? markError.message : "Failed to mark attendance.");
    } finally {
      setBusyEmployeeId(null);
    }
  };

  const saveStatus = async (employee: AttendedEmployeeDTO) => {
    const status = editedStatuses[employee.attendanceId] || "OFFICE";
    const halfDayType = editedHalfDays[employee.attendanceId] || "MORNING";
    setBusyEmployeeId(employee.empId);
    try {
      await attendanceService.updateAttendanceStatus(employee.attendanceId, {
        status,
        ...(status === "HALF_DAY" ? { halfDayType } : {}),
      });
      setEditingAttendanceId(null);
      await loadBoard(false);
      toast.success(`${employeeName({
        id: employee.empId,
        firstName: employee.firstName,
        lastName: employee.lastName,
      })} status updated to ${statusLabel(status, halfDayType)} ✅`);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Failed to update attendance.");
    } finally {
      setBusyEmployeeId(null);
    }
  };

  const saveOffTime = async () => {
    if (!offTimeEmployee || !offTimeValue) return;
    setBusyEmployeeId(offTimeEmployee.empId);
    try {
      await attendanceService.clockOut(offTimeEmployee.attendanceId, {
        endedAt: offTimeValue,
        departureReason: "Manual off-time",
      });
      const name = employeeName({
        id: offTimeEmployee.empId,
        firstName: offTimeEmployee.firstName,
        lastName: offTimeEmployee.lastName,
      });
      setOffTimeEmployee(null);
      await loadBoard(false);
      toast.success(`Off-time recorded for ${name}.`);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Failed to record off-time.");
    } finally {
      setBusyEmployeeId(null);
    }
  };

  const cancelLeaveAndMark = async () => {
    if (!leaveToCancel) return;
    const employee = leaveToCancel;
    setBusyEmployeeId(employee.id);
    try {
      const response = await axiosInstance.post<{
        resultCode: number;
        resultDesc?: string;
      }>("/emp_leave/cancel-leave-and-mark-attendance", {
        empId: employee.id,
        cancellationReason: cancellationReason || "Employee came to office",
        canceledBy: localStorage.getItem("userName") || "HR Admin",
      });
      if (response.data.resultCode !== 100) {
        throw new Error(response.data.resultDesc || "Failed to cancel leave.");
      }
      setLeaveToCancel(null);
      await loadBoard(false);
      toast.success(`Leave cancelled for ${employeeName(employee)}. They can now be marked.`);
    } catch (cancelError) {
      toast.error(cancelError instanceof Error ? cancelError.message : "Failed to cancel leave.");
    } finally {
      setBusyEmployeeId(null);
    }
  };

  const attendanceStatusSelect = (
    value: AttendanceStatus,
    onChange: (status: AttendanceStatus) => void,
    name: string,
  ) => (
    <select
      aria-label={`${name} attendance status`}
      value={value}
      onChange={(event) => onChange(event.target.value as AttendanceStatus)}
      className="min-w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
    >
      <option value="OFFICE">🏢 Office</option>
      <option value="WFH">🏠 Work From Home</option>
      <option value="HALF_DAY">⏰ Half Day</option>
      <option value="ABSENT">❌ Absent</option>
    </select>
  );

  if (loading) {
    return (
      <div role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <style>{`@keyframes attendanceSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } .attendance-slide-in { animation: attendanceSlideIn 240ms ease-out; }`}</style>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Department
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(Number(event.target.value))}
            className="min-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
          >
            <option value={0}>All departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.dpt_name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void loadBoard()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>
      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void loadBoard()} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}

      <SectionCard
        title="Pending Attendance"
        count={pendingInDepartment.length}
        search={pendingSearch}
        onSearchChange={setPendingSearch}
      >
        {filteredPending.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            {pendingInDepartment.length === 0
              ? "All eligible employees have been marked today ✅"
              : "No pending employees match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  {["Photo", "Name", "Employee ID", "Department", "Status", "Actions"].map((heading) => (
                    <th key={heading} className={tableHeadClass}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((record) => {
                  const employee = toPendingEmployee(record);
                  const status = pendingStatuses[employee.id] || "OFFICE";
                  return (
                    <tr key={employee.id} className={`${rowClass} attendance-slide-in`}>
                      <EmployeeCells employee={employee} photoUrl={photoUrls[employee.id]} />
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {attendanceStatusSelect(status, (nextStatus) =>
                            setPendingStatuses((previous) => ({ ...previous, [employee.id]: nextStatus })),
                          employeeName(employee))}
                          {status === "HALF_DAY" && (
                            <select
                              aria-label={`${employeeName(employee)} half-day period`}
                              value={pendingHalfDays[employee.id] || "MORNING"}
                              onChange={(event) =>
                                setPendingHalfDays((previous) => ({
                                  ...previous,
                                  [employee.id]: event.target.value as HalfDayType,
                                }))
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                            >
                              <option value="MORNING">Morning Half</option>
                              <option value="AFTERNOON">Afternoon Half</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={busyEmployeeId === employee.id}
                          onClick={() => void markAttendance(employee)}
                          className="whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busyEmployeeId === employee.id ? "Saving..." : "Mark Attendance"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Marked Today (Working)"
        count={workingInDepartment.length}
        search={markedSearch}
        onSearchChange={setMarkedSearch}
      >
        {filteredWorking.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            {workingInDepartment.length === 0
              ? "No working employees have been marked today."
              : "No marked employees match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  {["Photo", "Name", "Employee ID", "Department", "Current Status", "Marked At", "Actions"].map((heading) => (
                    <th key={heading} className={tableHeadClass}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWorking.map((employee) => {
                  const isEditing = editingAttendanceId === employee.attendanceId;
                  const currentStatus: AttendanceStatus =
                    employee.status.toUpperCase() === "ABSENT"
                      ? "ABSENT"
                      : employee.status.toUpperCase() === "HALF_DAY"
                        ? "HALF_DAY"
                        : employee.workingStatus.toUpperCase() === "WFH"
                          ? "WFH"
                          : "OFFICE";
                  const editStatus = editedStatuses[employee.attendanceId] || currentStatus;
                  const directoryEmployee: DirectoryEmployee = {
                    id: employee.empId,
                    epfNo: employee.epfNo,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    departmentId: employee.departmentId,
                    departmentName: employee.departmentName,
                  };
                  return (
                    <tr key={employee.attendanceId} className={`${rowClass} attendance-slide-in`}>
                      <EmployeeCells employee={directoryEmployee} photoUrl={photoUrls[employee.empId]} />
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {attendanceStatusSelect(editStatus, (nextStatus) =>
                              setEditedStatuses((previous) => ({
                                ...previous,
                                [employee.attendanceId]: nextStatus,
                              })),
                            employeeName(directoryEmployee))}
                            {editStatus === "HALF_DAY" && (
                              <select
                                aria-label={`${employeeName(directoryEmployee)} half-day period`}
                                value={editedHalfDays[employee.attendanceId] || employee.halfDayType || "MORNING"}
                                onChange={(event) =>
                                  setEditedHalfDays((previous) => ({
                                    ...previous,
                                    [employee.attendanceId]: event.target.value as HalfDayType,
                                  }))
                                }
                                className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                              >
                                <option value="MORNING">Morning Half</option>
                                <option value="AFTERNOON">Afternoon Half</option>
                              </select>
                            )}
                          </div>
                        ) : statusBadge(employee)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {employee.clockInTime
                          ? markedAtLabel(employee.clockInTime)
                          : "Time not recorded"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                disabled={busyEmployeeId === employee.empId}
                                onClick={() => void saveStatus(employee)}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAttendanceId(null)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAttendanceId(employee.attendanceId);
                                setEditedStatuses((previous) => ({
                                  ...previous,
                                  [employee.attendanceId]: currentStatus,
                                }));
                                setEditedHalfDays((previous) => ({
                                  ...previous,
                                  [employee.attendanceId]:
                                    (employee.halfDayType as HalfDayType) || "MORNING",
                                }));
                              }}
                              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                            >
                              Edit Status
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busyEmployeeId === employee.empId}
                            onClick={() => {
                              setOffTimeEmployee(employee);
                              setOffTimeValue(
                                employee.clockOutTime ||
                                  `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
                              );
                            }}
                            className="whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                          >
                            Mark Off-Time
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Off Today"
        count={offTodayEmployees.length}
        search={offTodaySearch}
        onSearchChange={setOffTodaySearch}
      >
        {filteredOffToday.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            {offTodayEmployees.length === 0
              ? "No employees have recorded an off-time today."
              : "No employees off today match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  {["Photo", "Name", "Employee ID", "Department", "Current Status", "Marked At", "Off-Time", "Actions"].map((heading) => (
                    <th key={heading} className={tableHeadClass}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOffToday.map((employee) => {
                  const directoryEmployee: DirectoryEmployee = {
                    id: employee.empId,
                    epfNo: employee.epfNo,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    departmentId: employee.departmentId,
                    departmentName: employee.departmentName,
                  };
                  return (
                    <tr key={employee.attendanceId} className={`${rowClass} attendance-slide-in`}>
                      <EmployeeCells employee={directoryEmployee} photoUrl={photoUrls[employee.empId]} />
                      <td className="px-4 py-3">{statusBadge(employee)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {employee.clockInTime ? markedAtLabel(employee.clockInTime) : "Time not recorded"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                        {markedAtLabel(employee.clockOutTime)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={busyEmployeeId === employee.empId}
                          onClick={() => {
                            setOffTimeEmployee(employee);
                            setOffTimeValue(employee.clockOutTime);
                          }}
                          className="whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                        >
                          Edit Off-Time
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Absent Today"
        count={absentInDepartment.length}
        search={absentSearch}
        onSearchChange={setAbsentSearch}
      >
        {filteredAbsent.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            {absentInDepartment.length === 0
              ? "No employees are marked absent today."
              : "No absent employees match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  {["Photo", "Name", "Employee ID", "Department", "Status", "Marked At", "Actions"].map((heading) => (
                    <th key={heading} className={tableHeadClass}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAbsent.map((employee) => {
                  const directoryEmployee: DirectoryEmployee = {
                    id: employee.empId,
                    epfNo: employee.epfNo,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    departmentId: employee.departmentId,
                    departmentName: employee.departmentName,
                  };
                  return (
                    <tr key={employee.attendanceId} className={rowClass}>
                      <EmployeeCells employee={directoryEmployee} photoUrl={photoUrls[employee.empId]} />
                      <td className="px-4 py-3">{statusBadge(employee)}</td>
                      <td className="px-4 py-3 text-slate-500">—</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAttendanceId(employee.attendanceId);
                            setEditedStatuses((previous) => ({
                              ...previous,
                              [employee.attendanceId]: "ABSENT",
                            }));
                          }}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                        >
                          Edit Status
                        </button>
                        {editingAttendanceId === employee.attendanceId && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {attendanceStatusSelect(
                              editedStatuses[employee.attendanceId] || "ABSENT",
                              (nextStatus) =>
                                setEditedStatuses((previous) => ({
                                  ...previous,
                                  [employee.attendanceId]: nextStatus,
                                })),
                              employeeName(directoryEmployee),
                            )}
                            <button
                              type="button"
                              disabled={busyEmployeeId === employee.empId}
                              onClick={() => void saveStatus(employee)}
                              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Employees on Leave"
        count={onLeaveEmployees.length}
        search={leaveSearch}
        onSearchChange={setLeaveSearch}
      >
        {filteredOnLeave.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            {onLeaveEmployees.length === 0
              ? "No employees on leave today"
              : "No employees on leave match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white">
                <tr>
                  {["Photo", "Name", "Employee ID", "Department", "Leave Type", "Period", "Reason", "Actions"].map((heading) => (
                    <th key={heading} className={tableHeadClass}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOnLeave.map((employee) => (
                  <tr key={employee.id} className={rowClass}>
                    <EmployeeCells employee={employee} photoUrl={photoUrls[employee.id]} />
                    <td className="px-4 py-3 text-slate-600">{employee.leaveType || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(employee.leaveStartDay).toLocaleDateString()} – {new Date(employee.leaveEndDay).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{employee.leaveReason || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={busyEmployeeId === employee.id}
                        onClick={() => {
                          setCancellationReason("Employee came to office");
                          setLeaveToCancel(employee);
                        }}
                        className="whitespace-nowrap rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                      >
                        Cancel Leave &amp; Mark Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {offTimeEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mark-off-time-title"
              className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl"
            >
              <h3 id="mark-off-time-title" className="text-lg font-semibold text-slate-800">
                Mark Off-Time
              </h3>
              <p className="text-sm text-slate-600">
                Record the off-time for {employeeName({
                  id: offTimeEmployee.empId,
                  firstName: offTimeEmployee.firstName,
                  lastName: offTimeEmployee.lastName,
                })}.
              </p>
              <label className="block text-sm font-medium text-slate-700">
                Off-time
                <input
                  type="time"
                  required
                  value={offTimeValue}
                  onChange={(event) => setOffTimeValue(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOffTimeEmployee(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!offTimeValue || busyEmployeeId === offTimeEmployee.empId}
                  onClick={() => void saveOffTime()}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Save Off-Time
                </button>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {leaveToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-leave-title"
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 id="cancel-leave-title" className="text-lg font-semibold text-slate-800">
              Cancel Leave &amp; Mark Attendance
            </h3>
            <p className="text-sm text-slate-600">
              {employeeName(leaveToCancel)} · {leaveToCancel.leaveType} ·{" "}
              {new Date(leaveToCancel.leaveStartDay).toLocaleDateString()} –{" "}
              {new Date(leaveToCancel.leaveEndDay).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-600">Reason: {leaveToCancel.leaveReason || "—"}</p>
            <label className="block text-sm font-medium text-slate-700">
              Cancellation reason
              <input
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLeaveToCancel(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyEmployeeId === leaveToCancel.id}
                onClick={() => void cancelLeaveAndMark()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Confirm &amp; Mark Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarkTable;
