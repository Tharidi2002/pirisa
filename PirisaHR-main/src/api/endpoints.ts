export const ENDPOINTS = {
    AUTH: {
      LOGIN: '/login',
      FORGOT_PASSWORD: '/password/forgotPassword',
      REGISTER: '/api/company/register',
    },
    COMPANY: {
      GET_ALL: '/api/company/all',
      GET_BY_ID: '/api/company',
      UPDATE: '/api/company/update',
      DELETE: '/api/company/delete',
    },
    EMPLOYEE: {
      GET_ALL: '/api/employee/all',
      GET_BY_ID: '/api/employee',
      CREATE: '/api/employee/create',
      UPDATE: '/api/employee/update',
      DELETE: '/api/employee/delete',
      GET_BY_COMPANY: '/api/employee/company',
    },
    USER: {
      GET_PROFILE: '/api/user/profile',
      UPDATE_PROFILE: '/api/user/update',
    },
  } as const;
