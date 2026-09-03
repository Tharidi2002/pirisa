import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

interface LeaveApproval {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedDate: string;
  employeeId: number;
}

const LeaveApprovalWorkflow = () => {
  const [leaves, setLeaves] = useState<LeaveApproval[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("cmpnyId");

  const userRole = localStorage.getItem("role");
  const canApprove = userRole === "CMPNY" || userRole === "HRM";

  useEffect(() => {
    if (!canApprove || !token || !companyId) return;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `http://167.172.95.86:8080/employee/EmpDetailsList/${companyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (res.ok) {
          const data = await res.json();
          const mockLeaves: LeaveApproval[] =
            data?.EmployeeList?.slice(0, 5).map(
              (emp: { id: number; firstName: string; lastName: string }, idx: number) => ({
                id: idx + 1,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                leaveType: ["Annual", "Sick", "Personal", "Maternity"][idx % 4],
                startDate: new Date(
                  Date.now() + (idx + 1) * 24 * 60 * 60 * 1000
                ).toISOString(),
                endDate: new Date(
                  Date.now() + (idx + 3) * 24 * 60 * 60 * 1000
                ).toISOString(),
                days: 2 + idx,
                reason: "Personal reasons",
                status: idx % 2 === 0 ? "PENDING" : "APPROVED",
                submittedDate: new Date(
                  Date.now() - (5 - idx) * 24 * 60 * 60 * 1000
                ).toISOString(),
                employeeId: emp.id,
              })
            ) || [];
          setLeaves(mockLeaves);
        }
      } catch {
        // Error loading
      }
    })();

    return () => controller.abort();
  }, [canApprove, token, companyId]);

  const filteredLeaves = useMemo(() => {
    if (filter === "PENDING") {
      return leaves.filter((l) => l.status === "PENDING");
    }
    return leaves;
  }, [leaves, filter]);

  const handleApprove = (leaveId: number) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId ? { ...l, status: "APPROVED" as const } : l
      )
    );
  };

  const handleReject = (leaveId: number) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId ? { ...l, status: "REJECTED" as const } : l
      )
    );
  };

  const stats = {
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!canApprove) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">Leave approvals available for HRM and Company admins only</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave approvals</h2>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
          <p className="text-sm text-yellow-700">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 border border-green-100">
          <p className="text-sm text-green-700">Approved</p>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <p className="text-sm text-red-700">Rejected</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === "PENDING"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending only
        </button>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All leaves
        </button>
      </div>

      {/* Leaves table */}
      <div className="space-y-3">
        {filteredLeaves.length > 0 ? (
          filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(leave.status)}
                  <div>
                    <p className="font-medium text-gray-900">{leave.employeeName}</p>
                    <p className="text-sm text-gray-600">{leave.leaveType} leave</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(leave.startDate).toLocaleDateString()} -{" "}
                  {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                    leave.status
                  )}`}
                >
                  {leave.status}
                </span>
                {leave.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-6 text-gray-500">No leaves to display</p>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalWorkflow;
