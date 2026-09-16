import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import Landing from "./pages/Landing";
import { MainLayout } from "./components/layout/MainLayout";
import AllEmployee from "./pages/EmployeeManagement/AllEmployeePage";
import DashboardPage from "./pages/DashboardPage";
import { LanguageProvider } from "./context/LanguageProvider";
import EmployeeRegistration from "./pages/EmployeeManagement/NewEmployeePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AttendanceContent from "./pages/Attendance/AttendanceContent";
import DepartmentManager from "./pages/CMPProfile/DepartmentManager";
import AttendanceMark from "./pages/Attendance/AttendanceMark";
import BulkAttendancePage from "./pages/Attendance/BulkAttendancePage";
import AttendanceReportPage from "./pages/Attendance/AttendanceReportPage";
import SalaryStatus from "./pages/PayRole/SalaryStatus";
import SalaryMakePage from "./pages/PayRole/SalaryMakePage";
import Invoice from "./pages/PayRole/PayslipList";
import LeaveRequest from "./pages/Leave/expoLeaveRequest";
import CompanyProfile from "./pages/CompanyProfile";
import EmployeeEvaluationForm from "./pages/PerformanceAppraisal/EmployeeEvaluationForm";
import NewEvaluationForm from "./pages/PerformanceAppraisal/NewEvaluationForm";
import EmployeeUpdate from "./pages/EmployeeManagement/EmployeeUpdate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PayroleReportPage from "./pages/Report/PayroleReportPage";
import CompanySettings from "./pages/CompanySettings";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import PayroleList from "./pages/Employee/PayroleList";
import EmployeeLeave from "./pages/Employee/EmployeeLeave";
import MonthlyCalendarPage from "./pages/Attendance/MonthlyCalendarPage";

// ============================================
// EMPLOYEE SELF-SERVICE PAGES
// ============================================
import SelfServiceDashboard from "./pages/EmployeeSelfService/SelfServiceDashboard";
import SelfServiceProfile from "./pages/EmployeeSelfService/SelfServiceProfile";
import SelfServicePayslips from "./pages/EmployeeSelfService/SelfServicePayslips";
import SelfServiceAttendance from "./pages/EmployeeSelfService/SelfServiceAttendance";
import SelfServiceLeaveBalance from "./pages/EmployeeSelfService/SelfServiceLeaveBalance";
import SelfServiceMissingPunch from "./pages/EmployeeSelfService/SelfServiceMissingPunch";

function App() {
  return (
    <div>
      <BrowserRouter>
        <LanguageProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="pay-role-list" element={<PayroleList />} />
                <Route path="emp-leave" element={<EmployeeLeave />} />

                {/* ============================================
                    EMPLOYEE SELF-SERVICE
                    ============================================ */}
                <Route path="self-service">
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<SelfServiceDashboard />} />
                  <Route path="profile" element={<SelfServiceProfile />} />
                  <Route path="payslips" element={<SelfServicePayslips />} />
                  <Route path="attendance" element={<SelfServiceAttendance />} />
                  <Route path="leave-balance" element={<SelfServiceLeaveBalance />} />
                  <Route path="missing-punch" element={<SelfServiceMissingPunch />} />
                </Route>

                {/* Employee Management */}
                <Route path="employee">
                  <Route index element={<Navigate to="all" replace />} />
                  <Route path="all" element={<AllEmployee />} />
                  <Route path="new" element={<EmployeeRegistration />} />
                  <Route path="edit/:id" element={<EmployeeUpdate />} />
                </Route>

                {/* Attendance */}
                <Route path="attendance">
                  <Route index element={<Navigate to="list" replace />} />
                  <Route path="list" element={<AttendanceContent />} />
                  <Route path="calendar" element={<MonthlyCalendarPage />} />
                  <Route path="mark" element={<AttendanceMark />} />
                  <Route path="bulk" element={<BulkAttendancePage />} />
                  <Route path="report" element={<AttendanceReportPage />} />
                </Route>

                {/* Payroll */}
                <Route path="payrole">
                  <Route index element={<Navigate to="salaryList" replace />} />
                  <Route path="salaryList" element={<SalaryStatus />} />
                  <Route path="makesalary/:employeeId" element={<SalaryMakePage />} />
                  <Route path="payslips/:employeeId" element={<Invoice />} />
                </Route>

                {/* Leave */}
                <Route path="leave">
                  <Route index element={<Navigate to="requests" replace />} />
                  <Route path="requests" element={<LeaveRequest />} />
                </Route>

                {/* Reports */}
                <Route path="reports">
                  <Route index element={<Navigate to="payRoleReport" replace />} />
                  <Route path="payRoleReport" element={<PayroleReportPage />} />
                  <Route path="summary-report" element={<DepartmentManager />} />
                </Route>

                {/* Performance */}
                <Route path="performance">
                  <Route index element={<Navigate to="evaluationForm" replace />} />
                  <Route path="evaluationForm" element={<EmployeeEvaluationForm />} />
                  <Route path="newForm" element={<NewEvaluationForm />} />
                </Route>

                {/* Company */}
                <Route path="companyProfile" element={<CompanyProfile />} />
                <Route path="company-settings" element={<CompanySettings />} />
              </Route>
            </Route>
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;