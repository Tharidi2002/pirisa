import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { selfServiceApi, LeaveBalanceSummary } from "../../api/services/selfServiceApi";

const SelfServiceLeaveBalance: React.FC = () => {
  const [summary, setSummary] = useState<LeaveBalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const employeeId = parseInt(localStorage.getItem("empId") || "0");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await selfServiceApi.getLeaveBalance(employeeId);
        setSummary(data);
      } catch {
        toast.error("Failed to load leave balance");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetch();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading leave balance..." />
      </div>
    );
  }

  if (!summary) {
    return <div className="p-6 text-center text-gray-500">No leave data available</div>;
  }

  const totalEntitled = summary.balances.reduce((s, b) => s + b.entitled, 0);
  const totalTaken = summary.balances.reduce((s, b) => s + b.taken, 0);
  const totalRemaining = summary.balances.reduce((s, b) => s + b.remaining, 0);
  const totalPending = summary.balances.reduce((s, b) => s + b.pending, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FaCalendarAlt className="text-orange-500" /> My Leave Balance
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          As of {summary.asOfDate} • {summary.employeeName}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl p-5 shadow-md">
          <FaCalendarAlt className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Entitled</p>
          <p className="text-3xl font-bold">{totalEntitled}</p>
          <p className="text-xs opacity-80 mt-1">days</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-5 shadow-md">
          <FaCheckCircle className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Remaining</p>
          <p className="text-3xl font-bold">{totalRemaining}</p>
          <p className="text-xs opacity-80 mt-1">days available</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-5 shadow-md">
          <FaTimesCircle className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Taken</p>
          <p className="text-3xl font-bold">{totalTaken}</p>
          <p className="text-xs opacity-80 mt-1">days used</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white rounded-xl p-5 shadow-md">
          <FaHourglassHalf className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold">{totalPending}</p>
          <p className="text-xs opacity-80 mt-1">awaiting approval</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Leave Type Breakdown</h2>
        <div className="space-y-4">
          {summary.balances.map((b) => {
            const percentage = b.entitled > 0 ? ((b.remaining / b.entitled) * 100) : 0;
            return (
              <div key={b.leaveType} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{b.leaveType}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    percentage > 50 ? "bg-green-100 text-green-700"
                    : percentage > 20 ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {b.remaining} / {b.entitled} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage > 50 ? "bg-green-500"
                      : percentage > 20 ? "bg-yellow-500"
                      : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Entitled</p>
                    <p className="font-semibold text-gray-800">{b.entitled}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Taken</p>
                    <p className="font-semibold text-gray-800">{b.taken}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Pending</p>
                    <p className="font-semibold text-gray-800">{b.pending}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelfServiceLeaveBalance;