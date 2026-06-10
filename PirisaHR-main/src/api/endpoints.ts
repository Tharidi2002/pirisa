export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/login",
    FORGOT_PASSWORD: "/api/password/forgotPassword",
    REGISTER: "/api/company/register",
  },
  COMPANY: {
    GET_ALL: "/api/company/all",
    GET_BY_ID: "/api/company/companyDetails",
    UPDATE: "/api/company",
    DELETE: "/api/company",
  },
  EMPLOYEE: {
    GET_ALL: "/api/employee/EmpDetailsList",
    GET_BY_ID: "/api/employee/emp",
    CREATE: "/api/employee/add_employee",
    UPDATE: "/api/employee",
    DELETE: "/api/employee",
    GET_BY_COMPANY: "/api/employee/company",
  },
  USER: {
    GET_PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/update",
  },  ATTENDANCE: {
    BASE: "/api/attendance",
    BULK_MARK: "/api/attendance/bulk-mark",
    BULK_DATA: "/api/attendance/bulk-data",
    IMPORT_EXCEL: "/api/attendance/import-excel",
    DOWNLOAD_EXCEL: "/api/attendance/download-excel",
  },} as const;
