import { useCallback, useEffect, useMemo, useState } from "react";
import { attendanceService, EmployeeDetailsDTO } from "../../api/services/attendanceService";

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const AttendanceReportPage = () => {
  const [employees, setEmployees] = useState<EmployeeDetailsDTO[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number>(0);
  const [selectedEmployee, setSelectedEmployee] = useState<number>(0);
  const [reportType, setReportType] = useState<string>("DAILY");
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const companyId = localStorage.getItem("cmpnyId");
  const currentUser = localStorage.getItem("userName") || "HR Admin";

  const loadEmployees = useCallback(async () => {
    if (!companyId) {
      return;
    }
    try {
      const data = await attendanceService.fetchEmployeesByCompany(companyId);
      setEmployees(data);
      const uniqueDepartments = Array.from(
        new Map(data.map((employee) => [employee.department?.id ?? 0, employee.department?.dpt_name ?? "Unassigned"]))
      )
        .filter(([id]) => id !== 0)
        .map(([id, name]) => ({ id, name }));
      setDepartments(uniqueDepartments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    }
  }, [companyId]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      return;
    }
    switch (reportType) {
      case "DAILY":
        setEndDate(startDate);
        break;
      case "WEEKLY": {
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        setEndDate(`${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`);
        break;
      }
      case "MONTHLY": {
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        setEndDate(`${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`);
        break;
      }
      case "YEARLY": {
        const end = new Date(date.getFullYear(), 11, 31);
        setEndDate(`${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`);
        break;
      }
      default:
        break;
    }
  }, [reportType, startDate]);

  const filteredEmployees = useMemo(
    () => employees.filter((employee) => {
      if (selectedDepartment !== 0 && employee.department?.id !== selectedDepartment) {
        return false;
      }
      if (selectedEmployee !== 0 && employee.id !== selectedEmployee) {
        return false;
      }
      return true;
    }),
    [employees, selectedDepartment, selectedEmployee]
  );

  const handleDownloadExcel = async () => {
    if (!companyId) {
      setError("Company ID missing. Please log in again.");
      return;
    }

    setDownloadLoading(true);
    setMessage(null);
    setError(null);

    try {
      const params: Record<string, string | number | undefined> = {
        type: reportType,
        department: selectedDepartment || undefined,
        empId: selectedEmployee || undefined,
        startDate,
        endDate,
      };
      const blob = await attendanceService.downloadAttendanceExcel(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${reportType.toLowerCase()}-${startDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Download started successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download report.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleImportExcel = async () => {
    if (!file) {
      setError("Please select an Excel file to import.");
      return;
    }

    setImportLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await attendanceService.importAttendanceExcel(file, currentUser);
      setMessage(
        response?.resultDesc
          ? `${response.resultDesc} (${response?.importedCount ?? 0} records)`
          : "Attendance import completed."
      );
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import Excel file.");
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Attendance Reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate Excel reports or import attendance data from a spreadsheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={downloadLoading}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {downloadLoading ? "Preparing report..." : "Download Excel Report"}
            </button>
          </div>
        </div>

        {(message || error) && (
          <div className="mt-4 space-y-2">
            {message && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="block rounded-lg border border-gray-200 bg-white p-4">
          <span className="text-sm font-medium text-gray-700">Report Type</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-3 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </label>

        <label className="block rounded-lg border border-gray-200 bg-white p-4">
          <span className="text-sm font-medium text-gray-700">Department</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(Number(e.target.value))}
            className="mt-3 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value={0}>All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block rounded-lg border border-gray-200 bg-white p-4">
          <span className="text-sm font-medium text-gray-700">Employee</span>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(Number(e.target.value))}
            className="mt-3 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value={0}>All Employees</option>
            {filteredEmployees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {`${employee.firstName} ${employee.lastName}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block rounded-lg border border-gray-200 bg-white p-4">
          <span className="text-sm font-medium text-gray-700">Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="block rounded-lg border border-gray-200 bg-white p-4">
          <span className="text-sm font-medium text-gray-700">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Import Attendance</h2>
            <p className="text-sm text-gray-600">Upload a formatted Excel file to import attendance records into the system.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="file"
              accept=".xlsx"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="button"
              onClick={handleImportExcel}
              disabled={importLoading || !file}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {importLoading ? "Importing..." : "Import Excel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportPage;
