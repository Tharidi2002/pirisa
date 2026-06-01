export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    FORGOT_PASSWORD: "/password/forgotPassword",
    REGISTER: "/api/company/register",
  },
  COMPANY: {
    GET_ALL: "/company/all",
    GET_BY_ID: "/company/companyDetails",
    UPDATE: "/company",
    DELETE: "/company",
  },
  EMPLOYEE: {
    GET_ALL: "/employee/EmpDetailsList",
    GET_BY_ID: "/employee/emp",
    CREATE: "/employee/add_employee",
    UPDATE: "/employee",
    DELETE: "/employee",
    GET_BY_COMPANY: "/employee/company",
  },
  USER: {
    GET_PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/update",
  },  ATTENDANCE: {
    BASE: "/api/attendance",
    BULK_MARK: "/api/attendance/bulk-mark",
    BULK_DATA: "/api/attendance/bulk-data",
    IMPORT_EXCEL: "/api/attendance/import-excel",
    DOWNLOAD_EXCEL: "/api/attendance/download-excel",
  },} as const;
