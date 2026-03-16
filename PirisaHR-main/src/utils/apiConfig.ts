// API Configuration for Pirisa HRM
export const getApiBaseUrl = () => {
  return import.meta.env.PROD 
    ? "http://129.212.239.12/api"
    : "http://localhost:8081/api";
};

export const getBaseUrl = () => {
  return import.meta.env.PROD 
    ? "http://129.212.239.12/api"
    : "http://localhost:8081/api";
};
