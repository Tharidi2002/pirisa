import { useState, type FormEvent } from "react";
import { attendanceService } from "../../api/services/attendanceService";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

const AttendanceReportView = () => {
  const [startDate, setStartDate] = useState(formatDate(monthStart));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (startDate > endDate) {
      setError("Start date must be on or before end date.");
      return;
    }

    try {
      setLoading(true);
      const workbook = await attendanceService.downloadAttendanceExcel({
        startDate,
        endDate,
      });
      const downloadUrl = URL.createObjectURL(workbook);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `attendance-report-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download attendance report.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4" aria-labelledby="attendance-report-title">
      <div>
        <h3
          id="attendance-report-title"
          className="text-lg font-semibold text-slate-800"
        >
          Attendance report
        </h3>
        <p className="text-sm text-slate-500">
          Download attendance records for a date range.
        </p>
      </div>
      <form
        onSubmit={downloadReport}
        className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Start date
          <input
            required
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          End date
          <input
            required
            type="date"
            value={endDate}
            min={startDate}
            max={formatDate(today)}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Preparing report..." : "Download Excel"}
        </button>
      </form>
      {error && (
        <p
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </section>
  );
};

export default AttendanceReportView;
