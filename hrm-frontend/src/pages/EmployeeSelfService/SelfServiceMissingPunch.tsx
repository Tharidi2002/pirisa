import React, { useCallback, useEffect, useState } from "react";
import { FaHourglassHalf, FaPlus, FaTimes, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import {
  selfServiceApi,
  MissingPunchRequest,
  MissingPunchRequestCreate,
} from "../../api/services/selfServiceApi";

type PunchType = "CLOCK_IN" | "CLOCK_OUT" | "BOTH";

const SelfServiceMissingPunch: React.FC = () => {
  const [requests, setRequests] = useState<MissingPunchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<MissingPunchRequestCreate>({
    attendanceDate: new Date().toISOString().split("T")[0],
    punchType: "BOTH",
    requestedStartedAt: "09:00",
    requestedEndedAt: "17:00",
    reason: "",
  });

  const employeeId = parseInt(localStorage.getItem("empId") || "0");

  const fetchRequests = useCallback(async () => {
    try {
      const data = await selfServiceApi.getMyMissingPunches(employeeId);
      setRequests(data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) fetchRequests();
  }, [employeeId, fetchRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.reason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      await selfServiceApi.submitMissingPunch(employeeId, form);
      toast.success("Request submitted!");
      setIsModalOpen(false);
      setForm({
        attendanceDate: new Date().toISOString().split("T")[0],
        punchType: "BOTH",
        requestedStartedAt: "09:00",
        requestedEndedAt: "17:00",
        reason: "",
      });
      await fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await selfServiceApi.cancelMissingPunch(employeeId, id);
      toast.success("Request cancelled");
      await fetchRequests();
    } catch {
      toast.error("Cancel failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading requests..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaHourglassHalf className="text-amber-500" /> Missing Punch Requests
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Request corrections for forgotten clock-in/out
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
          >
            <FaPlus /> New Request
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FaHourglassHalf className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-500">#{r.id}</span>
                  </div>
                  <p className="font-semibold text-gray-800">{r.attendanceDate}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {r.punchType === "BOTH" ? "Clock In & Out" :
                     r.punchType === "CLOCK_IN" ? "Clock In Only" : "Clock Out Only"}
                    {r.requestedStartedAt && ` • In: ${r.requestedStartedAt}`}
                    {r.requestedEndedAt && ` • Out: ${r.requestedEndedAt}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-2 italic">"{r.reason}"</p>
                  {r.rejectionReason && (
                    <p className="text-sm text-red-500 mt-2">Rejection: {r.rejectionReason}</p>
                  )}
                </div>
                {r.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">New Missing Punch Request</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Date *
                </label>
                <input
                  type="date"
                  value={form.attendanceDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, attendanceDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punch Type *
                </label>
                <select
                  value={form.punchType}
                  onChange={(e) => setForm({ ...form, punchType: e.target.value as PunchType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="CLOCK_IN">Clock In Only</option>
                  <option value="CLOCK_OUT">Clock Out Only</option>
                  <option value="BOTH">Both (Clock In & Out)</option>
                </select>
              </div>

              {(form.punchType === "CLOCK_IN" || form.punchType === "BOTH") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clock In Time *
                  </label>
                  <input
                    type="time"
                    value={form.requestedStartedAt || ""}
                    onChange={(e) => setForm({ ...form, requestedStartedAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              )}

              {(form.punchType === "CLOCK_OUT" || form.punchType === "BOTH") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clock Out Time *
                  </label>
                  <input
                    type="time"
                    value={form.requestedEndedAt || ""}
                    onChange={(e) => setForm({ ...form, requestedEndedAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason * <span className="text-xs text-gray-500">(min 10 characters)</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Explain why you couldn't punch in/out..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <FaCheckCircle /> {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfServiceMissingPunch;