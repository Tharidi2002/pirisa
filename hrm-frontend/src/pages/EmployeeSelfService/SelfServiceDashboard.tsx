import React, { useEffect, useState } from "react";
import {
  FaClock,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBriefcase,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import { selfServiceApi, SelfServiceDashboard as DashboardType } from "../../api/services/selfServiceApi";

const SelfServiceDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const employeeId = parseInt(localStorage.getItem("empId") || "0");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!employeeId) {
        setError("Employee ID not found. Please login again.");
        setLoading(false);
        return;
      }
      try {
        const data = await selfServiceApi.getDashboard(employeeId);
        setDashboard(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load dashboard";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error || "Dashboard not available"}</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "LEAVE":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "NOT_MARKED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return <FaCheckCircle />;
      case "ABSENT":
        return <FaTimesCircle />;
      case "LEAVE":
        return <FaCalendarAlt />;
      case "NOT_MARKED":
        return <FaHourglassHalf />;
      default:
        return <FaClock />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <FaUser className="text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {dashboard.employeeName}!</h1>
              <p className="text-white/90 text-sm flex items-center gap-2 mt-1">
                <FaBriefcase /> {dashboard.designation || "N/A"} • {dashboard.department || "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
            <div className="text-xs uppercase tracking-wider">Employee ID</div>
            <div className="text-lg font-bold">{dashboard.employeeId}</div>
          </div>
        </div>
      </div>

      {/* Today Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today Status Card */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Today's Status</h3>
            <div className={`p-2 rounded-lg ${getStatusColor(dashboard.todayStatus)}`}>
              {getStatusIcon(dashboard.todayStatus)}
            </div>
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${getStatusColor(dashboard.todayStatus)}`}>
            {dashboard.todayStatus.replace("_", " ")}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Clock In</p>
              <p className="font-semibold text-gray-800">{dashboard.clockInTime || "--:--"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Clock Out</p>
              <p className="font-semibold text-gray-800">{dashboard.clockOutTime || "--:--"}</p>
            </div>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
             onClick={() => navigate("/self-service/leave-balance")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Leave Balance</h3>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <FaCalendarAlt />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-800">{dashboard.leaveBalanceTotal}</div>
          <p className="text-sm text-gray-500 mt-1">days remaining</p>
          <div className="mt-3 flex items-center text-sky-600 text-sm font-medium">
            View details <FaArrowRight className="ml-1 text-xs" />
          </div>
        </div>

        {/* Hours Today Card */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hours Today</h3>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FaClock />
            </div>
          </div>
          <div className="text-4xl font-bold text-gray-800">{dashboard.totalHoursToday.toFixed(1)}</div>
          <p className="text-sm text-gray-500 mt-1">hours worked</p>
          {dashboard.pendingRequests > 0 && (
            <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              <FaHourglassHalf /> {dashboard.pendingRequests} pending request(s)
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/self-service/profile")}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors border border-sky-100"
          >
            <FaUser className="text-2xl text-sky-600" />
            <span className="text-sm font-medium text-sky-700">My Profile</span>
          </button>
          <button
            onClick={() => navigate("/self-service/payslips")}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors border border-green-100"
          >
            <FaMoneyBillWave className="text-2xl text-green-600" />
            <span className="text-sm font-medium text-green-700">My Payslips</span>
          </button>
          <button
            onClick={() => navigate("/self-service/attendance")}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100"
          >
            <FaClock className="text-2xl text-purple-600" />
            <span className="text-sm font-medium text-purple-700">My Attendance</span>
          </button>
          <button
            onClick={() => navigate("/self-service/missing-punch")}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100"
          >
            <FaHourglassHalf className="text-2xl text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Missing Punch</span>
          </button>
        </div>
      </div>

      {/* Recent Payslips & Upcoming Leaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Payslips */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Payslips</h3>
            <button
              onClick={() => navigate("/self-service/payslips")}
              className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center gap-1"
            >
              View All <FaArrowRight className="text-xs" />
            </button>
          </div>
          {dashboard.recentPayslips.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recentPayslips.map((payslip) => (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {payslip.month} {payslip.year}
                      </p>
                      <p className="text-xs text-gray-500">Net Salary</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      LKR {payslip.netSalary.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FaMoneyBillWave className="text-3xl mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No payslips available yet</p>
            </div>
          )}
        </div>

        {/* Upcoming Leaves */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Leaves</h3>
            <button
              onClick={() => navigate("/self-service/leave-balance")}
              className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center gap-1"
            >
              View Balance <FaArrowRight className="text-xs" />
            </button>
          </div>
          {dashboard.upcomingLeaves.length > 0 ? (
            <div className="space-y-2">
              {dashboard.upcomingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{leave.leaveType}</p>
                      <p className="text-xs text-gray-500">
                        {leave.startDate} → {leave.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{leave.days} day(s)</p>
                    <p className="text-xs text-green-600">{leave.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FaCalendarAlt className="text-3xl mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No upcoming leaves</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfServiceDashboard;