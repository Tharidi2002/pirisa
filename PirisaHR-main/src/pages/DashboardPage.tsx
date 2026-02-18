import AttendanceChart from "../components/dashboard/AttendanceChart";
import AttendanceStatsCard from "../components/dashboard/AttendanceStatsCard";
import CandidatesListTable from "../components/dashboard/CandidatesListTable";
import RealtimeInsightCard from "../components/dashboard/DashboardTimeCard";
import DepartmentStats from "../components/dashboard/DepartmentStats";
import EmployeeGrowthChart from "../components/dashboard/EmployeeGrowthChart";
import EmployeeGenderCard from "../components/dashboard/GenderChart";
import LeaveRequestTable from "../components/dashboard/LeaveRequestTable";

const DashboardPage = () => (
  <div className="flex flex-col gap-5">
    <div className="gap-2.5 flex flex-col md:flex-row">
      <RealtimeInsightCard />
      <AttendanceStatsCard />
    </div>
    <div className="gap-2.5 mt-2.5 flex flex-col md:flex-row">
      <EmployeeGenderCard />
      <EmployeeGrowthChart />
    </div>
    <AttendanceChart />
    <div className="gap-2.5 mt-2.5 flex flex-col md:flex-row">
      <div className="flex-1 md:flex-[3]">
        <LeaveRequestTable />
      </div>
      <div className="flex-1 md:flex-[2]">
        <DepartmentStats />
      </div>
    </div>
    <CandidatesListTable />
  </div>
);

export default DashboardPage;
