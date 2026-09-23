import { axiosInstance } from "../config/axios";
import {
  JobPosting,
  JobPostingRequest,
  Applicant,
  ApplicantRequest,
  ApplicantStatusUpdateRequest,
  Interview,
  InterviewRequest,
  InterviewFeedbackRequest,
  RecruitmentStats,
} from "../types/recruitment.types";

// ============================================
// JOB POSTINGS
// ============================================
export const jobPostingService = {
  createJob: async (companyId: number, data: JobPostingRequest): Promise<JobPosting> => {
    const response = await axiosInstance.post(`/api/recruitment/jobs?companyId=${companyId}`, data);
    return response.data.data;
  },

  getJobsByCompany: async (companyId: number): Promise<JobPosting[]> => {
    const response = await axiosInstance.get(`/api/recruitment/jobs/company/${companyId}`);
    return response.data.data;
  },

  getOpenJobs: async (companyId: number): Promise<JobPosting[]> => {
    const response = await axiosInstance.get(`/api/recruitment/jobs/company/${companyId}/open`);
    return response.data.data;
  },

  searchJobs: async (companyId: number, query: string): Promise<JobPosting[]> => {
    const response = await axiosInstance.get(`/api/recruitment/jobs/company/${companyId}/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  getJobById: async (jobId: number): Promise<JobPosting> => {
    const response = await axiosInstance.get(`/api/recruitment/jobs/${jobId}`);
    return response.data.data;
  },

  updateJob: async (jobId: number, data: JobPostingRequest): Promise<JobPosting> => {
    const response = await axiosInstance.put(`/api/recruitment/jobs/${jobId}`, data);
    return response.data.data;
  },

  updateJobStatus: async (jobId: number, status: string): Promise<JobPosting> => {
    const response = await axiosInstance.put(`/api/recruitment/jobs/${jobId}/status?status=${status}`);
    return response.data.data;
  },

  deleteJob: async (jobId: number): Promise<void> => {
    await axiosInstance.delete(`/api/recruitment/jobs/${jobId}`);
  },
};

// ============================================
// APPLICANTS
// ============================================
export const applicantService = {
  applyForJob: async (data: ApplicantRequest): Promise<Applicant> => {
    const response = await axiosInstance.post(`/api/recruitment/applicants/apply`, data);
    return response.data.data;
  },

  getApplicantsByCompany: async (companyId: number): Promise<Applicant[]> => {
    const response = await axiosInstance.get(`/api/recruitment/applicants/company/${companyId}`);
    return response.data.data;
  },

  getApplicantsByJob: async (jobId: number): Promise<Applicant[]> => {
    const response = await axiosInstance.get(`/api/recruitment/applicants/job/${jobId}`);
    return response.data.data;
  },

  getApplicantsByStatus: async (companyId: number, status: string): Promise<Applicant[]> => {
    const response = await axiosInstance.get(`/api/recruitment/applicants/company/${companyId}/status/${status}`);
    return response.data.data;
  },

  searchApplicants: async (companyId: number, query: string): Promise<Applicant[]> => {
    const response = await axiosInstance.get(`/api/recruitment/applicants/company/${companyId}/search?query=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  getApplicantById: async (applicantId: number): Promise<Applicant> => {
    const response = await axiosInstance.get(`/api/recruitment/applicants/${applicantId}`);
    return response.data.data;
  },

  updateApplicantStatus: async (applicantId: number, data: ApplicantStatusUpdateRequest): Promise<Applicant> => {
    const response = await axiosInstance.put(`/api/recruitment/applicants/${applicantId}/status`, data);
    return response.data.data;
  },

  updateApplicant: async (applicantId: number, data: ApplicantRequest): Promise<Applicant> => {
    const response = await axiosInstance.put(`/api/recruitment/applicants/${applicantId}`, data);
    return response.data.data;
  },

  deleteApplicant: async (applicantId: number): Promise<void> => {
    await axiosInstance.delete(`/api/recruitment/applicants/${applicantId}`);
  },
};

// ============================================
// INTERVIEWS
// ============================================
export const interviewService = {
  scheduleInterview: async (data: InterviewRequest): Promise<Interview> => {
    const response = await axiosInstance.post(`/api/recruitment/interviews`, data);
    return response.data.data;
  },

  getInterviewsByApplicant: async (applicantId: number): Promise<Interview[]> => {
    const response = await axiosInstance.get(`/api/recruitment/interviews/applicant/${applicantId}`);
    return response.data.data;
  },

  getUpcomingInterviews: async (companyId: number): Promise<Interview[]> => {
    const response = await axiosInstance.get(`/api/recruitment/interviews/company/${companyId}/upcoming`);
    return response.data.data;
  },

  getTodayInterviews: async (companyId: number): Promise<Interview[]> => {
    const response = await axiosInstance.get(`/api/recruitment/interviews/company/${companyId}/today`);
    return response.data.data;
  },

  updateFeedback: async (interviewId: number, data: InterviewFeedbackRequest): Promise<Interview> => {
    const response = await axiosInstance.put(`/api/recruitment/interviews/${interviewId}/feedback`, data);
    return response.data.data;
  },

  cancelInterview: async (interviewId: number): Promise<Interview> => {
    const response = await axiosInstance.put(`/api/recruitment/interviews/${interviewId}/cancel`);
    return response.data.data;
  },

  deleteInterview: async (interviewId: number): Promise<void> => {
    await axiosInstance.delete(`/api/recruitment/interviews/${interviewId}`);
  },
};

// ============================================
// STATS
// ============================================
export const recruitmentStatsService = {
  getStats: async (companyId: number): Promise<RecruitmentStats> => {
    const response = await axiosInstance.get(`/api/recruitment/stats/company/${companyId}`);
    return response.data.data;
  },
};