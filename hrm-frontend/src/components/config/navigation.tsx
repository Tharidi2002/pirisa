import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaChartBar,
  FaAccusoft,
  FaAddressCard,
  FaUserCircle,
} from "react-icons/fa";
import { NavItem } from "../types/navigation";

export const navItems: NavItem[] = [
  // ============================================
  // COMPANY ADMIN MENU
  // ============================================
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: FaTachometerAlt,
    subItems: [],
    roles: ["CMPNY"]
  },
  {
    id: "employee",
    path: "/employee",
    label: "Employee",
    icon: FaUsers,
    roles: ["CMPNY"],
    subItems: [
      { id: "all-employees", path: "/employee/all", label: "All Employees" },
      { id: "new-employee", path: "/employee/new", label: "New Employee" },
      { id: "edit-employee", path: "/employee/edit/:id", label: "Edit Employee" },
    ],
  },
  {
    id: "attendance",
    path: "/attendance",
    label: "Attendance",
    icon: FaCalendarAlt,
    roles: ["CMPNY"],
    subItems: [
      { id: "attendance-list", path: "/attendance/list", label: "Attendance List" },
      { id: "monthly-calendar", path: "/attendance/calendar", label: "Monthly Calendar" },
      { id: "mark-attendance", path: "/attendance/mark", label: "Mark Attendance" },
      { id: "bulk-attendance", path: "/attendance/bulk", label: "Bulk Attendance" },
      { id: "attendance-report", path: "/attendance/report", label: "Attendance Report" },
    ],
  },
  {
    id: "payrole",
    path: "/payrole",
    label: "Payrole",
    icon: FaDollarSign,
    roles: ["CMPNY"],
    subItems: [
      { id: "salaryList", path: "/payrole/salaryList", label: "Salary List" },
      { id: "makesalary", path: "/payrole/makesalary/:employeeId", label: "Make Salary" },
      { id: "payslips", path: "/payrole/payslips/:employeeId", label: "Pay Slips" }
    ],
  },
  {
    id: "leave",
    path: "/leave",
    label: "Leave",
    icon: FaAccusoft,
    roles: ["CMPNY"],
    subItems: [
      { id: "leave-requests", path: "/leave/requests", label: "Leave Requests" },
    ],
  },
  {
    id: "performance",
    path: "/performance",
    label: "Performance Appraisal",
    icon: FaChartBar,
    roles: ["CMPNY"],
    subItems: [
      { id: "evaluationForm", path: "/performance/evaluationForm", label: "Evaluation Form" },
      { id: "newForm", path: "/performance/newForm", label: "New Form" },
    ],
  },
  {
    id: "reports",
    path: "/reports",
    label: "Reports",
    icon: FaAddressCard,
    roles: ["CMPNY"],
    subItems: [
      { id: "payRoleReport", path: "/reports/payRoleReport", label: "Salary Report" },
    ],
  },

  // ============================================
  // EMPLOYEE MENU
  // ============================================
  {
    id: "emp-dashboard",
    path: "/employee-dashboard",
    label: "Employee Dashboard",
    icon: FaTachometerAlt,
    roles: ["EMPLOYEE"],
    subItems: []
  },
  {
    id: "self-service",
    path: "/self-service",
    label: "Self Service",
    icon: FaUserCircle,
    roles: ["EMPLOYEE"],
    subItems: [
      { id: "ss-dashboard", path: "/self-service/dashboard", label: "Dashboard" },
      { id: "ss-profile", path: "/self-service/profile", label: "My Profile" },
      { id: "ss-payslips", path: "/self-service/payslips", label: "My Payslips" },
      { id: "ss-attendance", path: "/self-service/attendance", label: "My Attendance" },
      { id: "ss-leave", path: "/self-service/leave-balance", label: "Leave Balance" },
      { id: "ss-missing", path: "/self-service/missing-punch", label: "Missing Punch" },
    ],
  },
  {
    id: "pay-role-list",
    path: "/pay-role-list",
    label: "Payrole List",
    icon: FaDollarSign,
    roles: ["EMPLOYEE"],
    subItems: []
  },
  {
    id: "emp-leave",
    path: "/emp-leave",
    label: "Leave",
    icon: FaAccusoft,
    roles: ["EMPLOYEE"],
    subItems: []
  }
];