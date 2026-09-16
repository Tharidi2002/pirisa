import { axiosInstance } from "../config/axios";

// ============================================
// TYPES
// ============================================
export interface SelfServiceDashboard {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  todayStatus: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHoursToday: number;
  leaveBalanceTotal: number;
  pendingRequests: number;
  recentPayslips: RecentPayslip[];
  upcomingLeaves: UpcomingLeave[];
}

export interface RecentPayslip {
  id: number;
  month: string;
  year: number;
  netSalary: number;
}

export interface UpcomingLeave {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

export interface EmployeeProfile {
  id: number;
  epfNo: string;
  empNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
  nic: string;
  dateOfJoining: string;
  status: string;
  departmentName: string;
  designationName: string;
  basicSalary: string;
  hasProfileImage: boolean;
}

export interface ProfileUpdateRequest {
  phone?: string;
  address?: string;
  email?: string;
}

export interface LeaveBalanceSummary {
  employeeId: number;
  employeeName: string;
  asOfDate: string;
  balances: LeaveTypeBalance[];
}

export interface LeaveTypeBalance {
  leaveType: string;
  entitled: number;
  taken: number;
  pending: number;
  remaining: number;
}

export interface MissingPunchRequest {
  id: number;
  employeeId: number;
  attendanceDate: string;
  punchType: string;
  requestedStartedAt: string | null;
  requestedEndedAt: string | null;
  reason: string;
  status: string;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface MissingPunchRequestCreate {
  attendanceDate: string;
  punchType: "CLOCK_IN" | "CLOCK_OUT" | "BOTH";
  requestedStartedAt?: string;
  requestedEndedAt?: string;
  reason: string;
}

export interface Payslip {
  id: number;
  year: number;
  month: string;
  allowance: string;
  overtimePay: number;
  bonusPay: string;
  appit: number;
  loan: number;
  otherDeductions: number;
  epf8: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  basicSalary: number;
}

export interface AttendanceRecord {
  id: number;
  attendanceDate: string;
  startedAt: string;
  endedAt: string;
  workingStatus: string;
  attendanceStatus: string;
  totalTime: number;
  dayName: string;
}

// ============================================
// API SERVICE
// ============================================
export const selfServiceApi = {
  /**
   * Get dashboard data
   */
  getDashboard: async (employeeId: number) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      data: SelfServiceDashboard;
    }>(`/api/self-service/dashboard/${employeeId}`);
    return response.data.data;
  },

  /**
   * Get profile
   */
  getProfile: async (employeeId: number) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      data: EmployeeProfile;
    }>(`/api/self-service/profile/${employeeId}`);
    return response.data.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (employeeId: number, request: ProfileUpdateRequest) => {
    const response = await axiosInstance.put<{
      resultCode: number;
      resultDesc: string;
      data: EmployeeProfile;
    }>(`/api/self-service/profile/${employeeId}`, request);
    return response.data.data;
  },

  /**
   * Get leave balance
   */
  getLeaveBalance: async (employeeId: number) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      data: LeaveBalanceSummary;
    }>(`/api/self-service/leave-balance/${employeeId}`);
    return response.data.data;
  },

  /**
   * Submit missing punch request
   */
  submitMissingPunch: async (employeeId: number, request: MissingPunchRequestCreate) => {
    const response = await axiosInstance.post<{
      resultCode: number;
      resultDesc: string;
      data: MissingPunchRequest;
    }>(`/api/self-service/missing-punch/${employeeId}`, request);
    return response.data.data;
  },

  /**
   * Get my missing punch requests
   */
  getMyMissingPunches: async (employeeId: number) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      data: MissingPunchRequest[];
    }>(`/api/self-service/missing-punch/${employeeId}`);
    return response.data.data;
  },

  /**
   * Cancel a missing punch request
   */
  cancelMissingPunch: async (employeeId: number, requestId: number) => {
    await axiosInstance.delete(`/api/self-service/missing-punch/${employeeId}/${requestId}`);
  },

  /**
   * Get my payslips
   */
  getMyPayslips: async (employeeId: number) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      data: Payslip[];
    }>(`/api/self-service/payslips/${employeeId}`);
    return response.data.data;
  },

  /**
   * Get my attendance history
   */
  getMyAttendance: async (employeeId: number, month?: number, year?: number) => {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      data: AttendanceRecord[];
    }>(`/api/self-service/attendance/${employeeId}`, { params });
    return response.data.data;
  },
};