import { useEffect, useState } from "react";
import AttendanceChart from "../components/dashboard/AttendanceChart";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DepartmentStats from "../components/dashboard/DepartmentStats";
import ExecutiveOverview from "../components/dashboard/ExecutiveOverview";
import LeaveRequestTable from "../components/dashboard/LeaveRequestTable";
import CompanyAdminDashboard from "../components/dashboard/CompanyAdminDashboard";
import LeaveApprovalWorkflow from "../components/dashboard/LeaveApprovalWorkflow";
import EmployeeOnboardingChecklist from "../components/dashboard/EmployeeOnboardingChecklist";

const DashboardPage = () => {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = localStorage.getItem("role") || "EMPLOYEE";
    setUserRole(role);
  }, []);

  // Company admin and HRM roles get a full admin dashboard
  if (userRole === "CMPNY" || userRole === "HRM") {
    return (
      <div className="flex flex-col gap-6 w-full">
        <CompanyAdminDashboard />
        <LeaveApprovalWorkflow />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <AttendanceChart />
          </div>
          <div className="lg:col-span-4">
            <DepartmentStats />
          </div>
        </div>
        <div className="w-full">
          <DashboardCalendar />
        </div>
        <div className="w-full">
          <LeaveRequestTable />
        </div>
      </div>
    );
  }

  // Employee role gets employee-focused dashboard
  return (
    <div className="flex flex-col gap-5 w-full">
      <ExecutiveOverview />
      <EmployeeOnboardingChecklist />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AttendanceChart />
        </div>
        <div className="lg:col-span-4">
          <DepartmentStats />
        </div>
      </div>
      <div className="w-full">
        <DashboardCalendar />
      </div>
    </div>
  );
};

export default DashboardPage;
