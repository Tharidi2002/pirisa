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
