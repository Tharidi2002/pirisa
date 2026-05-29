import { axiosInstance } from "../config/axios";
import { ENDPOINTS } from "../endpoints";

export type AttendanceRowPayload = {
  empId: number;
  attendanceDate: string;
  startedAt: string | null;
  endedAt: string | null;
  working_status: string;
  attendance_status: string;
  entryType: string;
  createdBy: string;
};

export type EmployeeDetailsDTO = {
  id: number;
  firstName: string;
  lastName: string;
  epfNo?: string;
  dateOfJoining?: string;
  department?: {
    id: number;
    dpt_name: string;
  };
};

export type PendingEmployeeDTO = {
  id: number;
  epfNo?: string;
  firstName: string;
  lastName: string;
  dateOfJoining?: string;
  departmentId?: number;
  departmentName?: string;
};

export type AttendedEmployeeDTO = {
  empId: number;
  epfNo?: string;
  firstName: string;
  lastName: string;
  departmentId?: number;
  departmentName?: string;
  clockInTime: string;
  status: string;
  attendanceDate: string;
  attendanceId: number;
};

export type ExcludedEmployeeDTO = {
  id: number;
  epfNo?: string;
  firstName: string;
  lastName: string;
  dateOfJoining?: string;
  departmentId?: number;
  departmentName?: string;
};

export type BulkAttendanceDataResponse = {
  pendingEmployees: PendingEmployeeDTO[];
  attendedEmployees: AttendedEmployeeDTO[];
  excludedEmployees: ExcludedEmployeeDTO[];
};

export const attendanceService = {
  fetchEmployeesByCompany: async (companyId: string | number) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      EmployeeList: EmployeeDetailsDTO[];
    }>(`/employee/EmpDetailsList/${companyId}`);

    return response.data.EmployeeList ?? [];
  },

  bulkMarkAttendance: async (attendanceList: AttendanceRowPayload[]) => {
    const response = await axiosInstance.post(ENDPOINTS.ATTENDANCE.BULK_MARK, attendanceList);
    return response.data;
  },

  fetchBulkAttendanceData: async (
    companyId: string | number,
    attendanceDate: string,
    departmentId?: number
  ) => {
    const response = await axiosInstance.get<{
      resultCode: number;
      resultDesc: string;
      attendanceData: BulkAttendanceDataResponse;
    }>(ENDPOINTS.ATTENDANCE.BULK_DATA, {
      params: { companyId, attendanceDate, departmentId },
    });
    return response.data.attendanceData;
  },

  importAttendanceExcel: async (file: File, createdBy: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("createdBy", createdBy);

    const response = await axiosInstance.post(ENDPOINTS.ATTENDANCE.IMPORT_EXCEL, formData);

    return response.data;
  },

  downloadAttendanceExcel: async (params: Record<string, string | number | undefined>) => {
    const response = await axiosInstance.get(ENDPOINTS.ATTENDANCE.DOWNLOAD_EXCEL, {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
