import AttendanceChart from "../components/dashboard/AttendanceChart";
import AttendanceStatsCard from "../components/dashboard/AttendanceStatsCard";
import CandidatesListTable from "../components/dashboard/CandidatesListTable";
import RealtimeInsightCard from "../components/dashboard/DashboardTimeCard";
import DepartmentStats from "../components/dashboard/DepartmentStats";
import EmployeeGrowthChart from "../components/dashboard/EmployeeGrowthChart";
import EmployeeGenderCard from "../components/dashboard/GenderChart";
import LeaveRequestTable from "../components/dashboard/LeaveRequestTable";

const DashboardPage = () => (
  <div className="flex flex-col gap-5 w-full">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4">
        <RealtimeInsightCard />
      </div>
      <div className="lg:col-span-8">
        <AttendanceStatsCard />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4">
        <EmployeeGenderCard />
      </div>
      <div className="lg:col-span-8">
        <EmployeeGrowthChart />
      </div>
    </div>

    <div className="w-full">
      <AttendanceChart />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <LeaveRequestTable />
      </div>
      <div className="lg:col-span-4">
        <DepartmentStats />
      </div>
    </div>

    <CandidatesListTable />
  </div>
);

export default DashboardPage;
