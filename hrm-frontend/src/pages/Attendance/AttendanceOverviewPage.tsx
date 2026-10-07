import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  attendanceService,
  type AttendanceOverviewResponse,
  type AttendanceDepartmentDTO,
} from "../../api/services/attendanceService";
import AttendanceTable from "../../components/Attendance/AttendanceTable";
import AttendanceMarkTable from "../../components/Attendance/AttendanceMarkTable";
import MonthlyAttendanceCalendar from "../../components/Attendance/MonthlyAttendanceCalendar";
import AttendanceReportView from "./AttendanceReportView";

type ViewKey = "overview" | "list" | "mark" | "calendar" | "report";
const VIEW_KEYS: ViewKey[] = ["overview", "list", "mark", "calendar", "report"];

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatLabel = (value?: string) =>
  value
    ? value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())
    : "Not recorded";

const employeeName = (firstName: string, lastName: string) =>
  [firstName, lastName].filter(Boolean).join(" ") || "Unknown employee";

const AttendanceOverviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [overview, setOverview] = useState<AttendanceOverviewResponse | null>(
    null,
  );
  const [departments, setDepartments] = useState<AttendanceDepartmentDTO[]>([]);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const companyId = localStorage.getItem("cmpnyId") || "0";
  const requestedView = searchParams.get("view");
  const activeView: ViewKey = VIEW_KEYS.includes(requestedView as ViewKey)
    ? (requestedView as ViewKey)
    : "overview";
  const attendanceData = overview?.attendanceData;
  const attendedEmployees = attendanceData?.attendedEmployees ?? [];
  const pendingEmployees = attendanceData?.pendingEmployees ?? [];
  const excludedEmployees = attendanceData?.excludedEmployees ?? [];
  const summary = overview?.summary;
  const expectedEmployeeCount =
    (summary?.attendedCount ?? attendedEmployees.length) +
    (summary?.pendingCount ?? pendingEmployees.length);
  const attendanceRate =
    expectedEmployeeCount > 0
      ? Math.round((attendedEmployees.length / expectedEmployeeCount) * 100)
      : 0;
  const selectedDepartmentName =
    departments.find((department) => String(department.id) === selectedDepartment)
      ?.dpt_name ?? "All departments";

  useEffect(() => {
    if (companyId === "0") {
      setDepartmentError("Company information is missing. Please log in again.");
      return;
    }

    const loadDepartments = async () => {
      try {
        setDepartmentError(null);
        setDepartments(await attendanceService.fetchDepartments(companyId));
      } catch (loadError) {
        setDepartmentError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load departments.",
        );
      }
    };

    void loadDepartments();
  }, [companyId, refreshVersion]);

  useEffect(() => {
    if (companyId === "0") {
      setLoading(false);
      setError("Company information is missing. Please log in again.");
      return;
    }

    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await attendanceService.fetchAttendanceOverview(
          companyId,
          selectedDate,
          selectedDepartment ? Number(selectedDepartment) : undefined,
        );
        setOverview(data);
      } catch (loadError) {
        setOverview(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load attendance overview.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOverview();
  }, [companyId, selectedDate, selectedDepartment, refreshVersion]);

  const tabs = useMemo(
    () => [
      { key: "overview" as const, label: "Overview" },
      { key: "list" as const, label: "Attendance list" },
      { key: "mark" as const, label: "Mark attendance" },
      { key: "calendar" as const, label: "Calendar" },
      { key: "report" as const, label: "Reports" },
    ],
    [],
  );

  const changeView = (view: ViewKey) => {
    const nextParams = new URLSearchParams(searchParams);
    if (view === "overview") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", view);
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Attendance overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Daily attendance status and follow-up for your team.
          </p>
        </div>
        <nav
          aria-label="Attendance sections"
          className="flex flex-wrap gap-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-current={activeView === tab.key ? "page" : undefined}
              onClick={() => changeView(tab.key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeView === tab.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeView === "overview" && (
        <section className="space-y-5" aria-label="Attendance overview">
          <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Attendance date
                <input
                  type="date"
                  value={selectedDate}
                  max={getTodayDate()}
                  onChange={(event) => {
                    if (event.target.value) setSelectedDate(event.target.value);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Department
                <select
                  value={selectedDepartment}
                  onChange={(event) => setSelectedDepartment(event.target.value)}
                  className="min-w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
                >
                  <option value="">All departments</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.dpt_name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setRefreshVersion((version) => version + 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
            <p className="text-sm text-slate-500">
              {formatDate(selectedDate)} · {selectedDepartmentName}
            </p>
          </div>
          {departmentError && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              Department filter unavailable: {departmentError}
            </p>
          )}

          {loading ? (
            <div
              role="status"
              className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500"
            >
              Loading attendance for {formatDate(selectedDate)}...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              {error}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Employees in scope"
                  value={
                    (summary?.attendedCount ?? attendedEmployees.length) +
                    (summary?.pendingCount ?? pendingEmployees.length) +
                    (summary?.excludedCount ?? excludedEmployees.length)
                  }
                  detail="For this date and department"
                  color="text-slate-800"
                />
                <SummaryCard
                  label="Attended"
                  value={summary?.attendedCount ?? attendedEmployees.length}
                  detail={`${attendanceRate}% of employees expected to attend`}
                  color="text-emerald-700"
                />
                <SummaryCard
                  label="Pending"
                  value={summary?.pendingCount ?? pendingEmployees.length}
                  detail="Attendance not recorded yet"
                  color="text-amber-700"
                />
                <SummaryCard
                  label="Not expected"
                  value={summary?.excludedCount ?? excludedEmployees.length}
                  detail="Not eligible on the selected date"
                  color="text-slate-600"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Attendance progress
                    </h3>
                    <p className="text-sm text-slate-500">
                      {attendedEmployees.length} of {expectedEmployeeCount}{" "}
                      expected employees recorded
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-indigo-700">
                    {attendanceRate}%
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="Attendance completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={attendanceRate}
                >
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>

              <section
                aria-labelledby="recorded-attendance-title"
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <h3
                      id="recorded-attendance-title"
                      className="font-semibold text-slate-800"
                    >
                      Recorded attendance
                    </h3>
                    <p className="text-sm text-slate-500">
                      Clock-in, clock-out and work arrangement for the selected
                      date.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    {attendedEmployees.length} recorded
                  </span>
                </div>
                {attendedEmployees.length === 0 ? (
                  <EmptyMessage>
                    No attendance has been recorded for this date and
                    department.
                  </EmptyMessage>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Employee</th>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Clock in</th>
                          <th className="px-4 py-3">Clock out</th>
                          <th className="px-4 py-3">Work arrangement</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendedEmployees.map((employee) => (
                          <tr key={employee.attendanceId}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">
                                {employeeName(
                                  employee.firstName,
                                  employee.lastName,
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                EPF {employee.epfNo || "Not set"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {employee.departmentName || "Unassigned"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {employee.clockInTime || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {employee.clockOutTime || "On shift"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {formatLabel(employee.workingStatus)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  employee.clockOutTime
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {employee.clockOutTime
                                  ? formatLabel(employee.status)
                                  : "On shift"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="grid gap-5 xl:grid-cols-2">
                <EmployeeFollowUp
                  title="Awaiting attendance"
                  count={pendingEmployees.length}
                  employees={pendingEmployees.map((employee) => ({
                    name: employeeName(employee.firstName, employee.lastName),
                    epfNo: employee.epfNo,
                    departmentName: employee.departmentName,
                    detail: employee.dateOfJoining
                      ? `Joined ${employee.dateOfJoining}`
                      : "Joining date not recorded",
                  }))}
                  emptyMessage="Everyone expected to attend has a record."
                  actionLabel="Mark attendance"
                  onAction={() => changeView("mark")}
                  tone="amber"
                />
                <EmployeeFollowUp
                  title="Not yet eligible"
                  count={excludedEmployees.length}
                  employees={excludedEmployees.map((employee) => ({
                    name: employeeName(employee.firstName, employee.lastName),
                    epfNo: employee.epfNo,
                    departmentName: employee.departmentName,
                    detail: employee.dateOfJoining
                      ? `Joining date: ${employee.dateOfJoining}`
                      : "Joining date not recorded",
                  }))}
                  emptyMessage="No employees are excluded for this date."
                  tone="slate"
                />
              </div>
            </>
          )}
        </section>
      )}

      {activeView === "list" && <AttendanceTable />}
      {activeView === "mark" && <AttendanceMarkTable />}
      {activeView === "calendar" && <MonthlyAttendanceCalendar />}
      {activeView === "report" && <AttendanceReportView />}
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>
);

const EmptyMessage = ({ children }: { children: string }) => (
  <p className="px-4 py-8 text-center text-sm text-slate-500">{children}</p>
);

const EmployeeFollowUp = ({
  title,
  count,
  employees,
  emptyMessage,
  actionLabel,
  onAction,
  tone,
}: {
  title: string;
  count: number;
  employees: {
    name: string;
    epfNo?: string;
    departmentName?: string;
    detail: string;
  }[];
  emptyMessage: string;
  actionLabel?: string;
  onAction?: () => void;
  tone: "amber" | "slate";
}) => (
  <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{count} employees</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
    {employees.length === 0 ? (
      <EmptyMessage>{emptyMessage}</EmptyMessage>
    ) : (
      <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
        {employees.map((employee, index) => (
          <li
            key={`${employee.epfNo ?? employee.name}-${index}`}
            className="flex items-start justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-800">{employee.name}</p>
              <p className="text-xs text-slate-500">
                {employee.epfNo ? `EPF ${employee.epfNo} · ` : ""}
                {employee.departmentName || "Unassigned"}
              </p>
              <p className="mt-1 text-xs text-slate-500">{employee.detail}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                tone === "amber"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tone === "amber" ? "Pending" : "Not expected"}
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default AttendanceOverviewPage;
