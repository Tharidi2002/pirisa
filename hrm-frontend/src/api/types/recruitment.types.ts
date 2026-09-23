// Job Posting Types
export interface JobPosting {
  id: number;
  companyId: number;
  title: string;
  description: string;
  departmentId?: number;
  departmentName?: string;
  designationId?: number;
  designationName?: string;
  employmentType: string; // FULL_TIME, PART_TIME, CONTRACT, INTERN
  experienceLevel: string; // ENTRY, MID, SENIOR, LEAD
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  vacancies: number;
  postedDate: string;
  closingDate?: string;
  status: string; // OPEN, CLOSED, ON_HOLD
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobPostingRequest {
  title: string;
  description?: string;
  departmentId?: number;
  designationId?: number;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  vacancies?: number;
  closingDate?: string;
  status?: string;
}

// Applicant Types
export interface Applicant {
  id: number;
  jobId: number;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  nic?: string;
  dateOfBirth?: string;
  gender?: string;
  resumeUrl?: string;
  coverLetter?: string;
  experienceYears?: number;
  currentCompany?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  status: string; // NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
  source?: string;
  notes?: string;
  appliedAt: string;
  updatedAt: string;
  fullName: string;
}

export interface ApplicantRequest {
  jobId: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  nic?: string;
  dateOfBirth?: string;
  gender?: string;
  resumeUrl?: string;
  coverLetter?: string;
  experienceYears?: number;
  currentCompany?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  source?: string;
  notes?: string;
}

export interface ApplicantStatusUpdateRequest {
  status: string;
  notes?: string;
}

// Interview Types
export interface Interview {
  id: number;
  applicantId: number;
  applicantName: string;
  jobTitle: string;
  interviewDate: string;
  interviewType: string; // PHONE, VIDEO, IN_PERSON, TECHNICAL
  interviewerId?: number;
  interviewerName?: string;
  location?: string;
  meetingLink?: string;
  status: string; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
  feedback?: string;
  rating?: number;
}

export interface InterviewRequest {
  applicantId: number;
  interviewDate: string;
  interviewType: string;
  interviewerId?: number;
  location?: string;
  meetingLink?: string;
}

export interface InterviewFeedbackRequest {
  status?: string;
  feedback?: string;
  rating?: number;
}

// Stats Type
export interface RecruitmentStats {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalApplicants: number;
  newApplicants: number;
  screeningApplicants: number;
  interviewApplicants: number;
  offerApplicants: number;
  hiredApplicants: number;
  rejectedApplicants: number;
  upcomingInterviews: number;
  todayInterviews: number;
}