import AttendanceChart from "../components/dashboard/AttendanceChart";
import DashboardCalendar from "../components/dashboard/DashboardCalendar";
import DepartmentStats from "../components/dashboard/DepartmentStats";
import ExecutiveOverview from "../components/dashboard/ExecutiveOverview";
import LeaveRequestTable from "../components/dashboard/LeaveRequestTable";
import CompanyAdminDashboard from "../components/dashboard/CompanyAdminDashboard";
import LeaveApprovalWorkflow from "../components/dashboard/LeaveApprovalWorkflow";
import EmployeeOnboardingChecklist from "../components/dashboard/EmployeeOnboardingChecklist";

interface DashboardSection {
  id: string;
  label: string;
}

const DashboardSectionNavigation = ({
  sections,
}: {
  sections: DashboardSection[];
}) => (
  <nav
    className="dashboard-section-nav sticky top-[68px] z-20"
    aria-label="Dashboard sections"
  >
    {sections.map((section) => (
      <a key={section.id} href={`#${section.id}`}>
        {section.label}
      </a>
    ))}
  </nav>
);

const DashboardPage = () => {
  const userRole = localStorage.getItem("role") || "EMPLOYEE";

  // Company admin and HRM roles get a full admin dashboard
  if (userRole === "CMPNY" || userRole === "HRM") {
    return (
      <div className="flex flex-col gap-6 w-full">
        <DashboardSectionNavigation
          sections={[
            { id: "company-summary", label: "Summary" },
            { id: "leave-approvals", label: "Leave approvals" },
            { id: "attendance-trends", label: "Attendance" },
            { id: "company-calendar", label: "Calendar" },
            { id: "leave-requests", label: "Leave records" },
          ]}
        />
        <CompanyAdminDashboard />
        <div id="leave-approvals" className="scroll-mt-36">
          <LeaveApprovalWorkflow />
        </div>
        <div id="attendance-trends" className="w-full scroll-mt-36">
          <AttendanceChart />
        </div>
        <div id="company-calendar" className="w-full scroll-mt-36">
          <DashboardCalendar />
        </div>
        <div id="leave-requests" className="w-full scroll-mt-36">
          <LeaveRequestTable />
        </div>
      </div>
    );
  }

  // Employee role gets employee-focused dashboard
  return (
    <div className="flex flex-col gap-5 w-full">
      <DashboardSectionNavigation
        sections={[
          { id: "employee-summary", label: "Summary" },
          { id: "employee-onboarding", label: "Onboarding" },
          { id: "attendance-trends", label: "Attendance" },
          { id: "department-summary", label: "Department" },
          { id: "employee-calendar", label: "Calendar" },
        ]}
      />
      <div id="employee-summary" className="scroll-mt-36">
        <ExecutiveOverview />
      </div>
      <div id="employee-onboarding" className="scroll-mt-36">
        <EmployeeOnboardingChecklist />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div id="attendance-trends" className="lg:col-span-8 scroll-mt-36">
          <AttendanceChart />
        </div>
        <div id="department-summary" className="lg:col-span-4 scroll-mt-36">
          <DepartmentStats />
        </div>
      </div>
      <div id="employee-calendar" className="w-full scroll-mt-36">
        <DashboardCalendar />
      </div>
    </div>
  );
};

export default DashboardPage;
