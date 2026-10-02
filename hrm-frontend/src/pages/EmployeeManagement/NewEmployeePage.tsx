/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  TranslatableOption,
  TranslatableText,
} from "../../components/languages/TranslatableText";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../components/Loading/Loading";
import ProfileImageEditor from "../../components/ProfileImageEditor";
import { API_BASE } from "../../api/endpoints";
import LkrInput from "../../components/PayRole/LkrInput";
import { useTranslation } from "../../context/LanguageProvider";
import { isNonNegativeNumber } from "../../utils/validation";

interface EmployeeDetails {
  epf_no: string;
  emp_no: string;
  first_name: string;
  last_name: string;
  designation: string;
  department: string;
  basic_salary: string;
  email: string;
  gender: string;
  DOB: string;
  phone: string;
  address: string;
  nic: string;
  date_of_joining: string;
  cmp_id: number;
  dptId: number;
  designationId: number;
}

interface Document {
  birthCertificate: File | null;
  cv: File | null;
  idCopy: File | null;
  policeReport: File | null;
  bankPassbook: File | null;
  appointmentLetter: File | null;
}

interface Department {
  id: number;
  dpt_name: string;
  designationList: Designation[];
}

interface Designation {
  id: number;
  designation: string;
  dptId: number;
}

const EmployeeRegistration: React.FC = () => {
  const { language } = useTranslation();
  const [step, setStep] = useState(1);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails>({
    epf_no: "",
    emp_no: "",
    first_name: "",
    last_name: "",
    department: "",
    designation: "",
    basic_salary: "",
    email: "",
    gender: "",
    DOB: "",
    phone: "",
    address: "",
    nic: "",
    date_of_joining: "",
    cmp_id: 0,
    dptId: 0,
    designationId: 0,
  });

  const [documents, setDocuments] = useState<Document>({
    birthCertificate: null,
    cv: null,
    idCopy: null,
    policeReport: null,
    bankPassbook: null,
    appointmentLetter: null,
  });

  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(
    null,
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [empId, setEmpId] = useState<number | null>(null); // To store the employee ID from Step 1
  const [submittingDetails, setSubmittingDetails] = useState(false); // Loading state for Step 1
  const [submittingDocs, setSubmittingDocs] = useState(false); // Loading state for Step 2
  const submittingDetailsRef = useRef(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found in local storage");
      // Redirect to login or handle token absence
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchDepartments();
      fetchNextNumbers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchNextNumbers = async () => {
    const cmpId =
      localStorage.getItem("cmpnyId") || localStorage.getItem("companyId");
    try {
      const response = await fetch(`${API_BASE}/employee/next-numbers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.emp_no && data.epf_no) {
          setEmployeeDetails((prev) => ({
            ...prev,
            emp_no: data.emp_no,
            epf_no: data.epf_no,
          }));
          return;
        }
      }
    } catch (error) {
      console.warn(
        "Could not fetch next-numbers directly, falling back to employee list calculation:",
        error,
      );
    }

    // Fallback: calculate directly from existing employees if endpoint returned error or not yet reloaded
    if (cmpId) {
      try {
        const listRes = await fetch(`${API_BASE}/employee/company/${cmpId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          const list: Array<{ empNo?: string; epfNo?: string }> = Array.isArray(
            listData.EmployeeList,
          )
            ? listData.EmployeeList
            : [];
          let maxEmp = 0;
          let maxEpf = 0;
          list.forEach((emp) => {
            if (emp.empNo && typeof emp.empNo === "string") {
              const digits = emp.empNo.replace(/\D/g, "");
              if (digits) {
                const n = parseInt(digits, 10);
                if (n > maxEmp) maxEmp = n;
              }
            }
            if (emp.epfNo && typeof emp.epfNo === "string") {
              const digits = emp.epfNo.replace(/\D/g, "");
              if (digits) {
                const n = parseInt(digits, 10);
                if (n > maxEpf) maxEpf = n;
              }
            }
          });
          const nextEmp = Math.max(maxEmp + 1, list.length + 1);
          const nextEpf = Math.max(maxEpf + 1, list.length + 1);
          setEmployeeDetails((prev) => ({
            ...prev,
            emp_no: `EMP${String(nextEmp).padStart(4, "0")}`,
            epf_no: `EPF${String(nextEpf).padStart(4, "0")}`,
          }));
          return;
        }
      } catch (err) {
        console.error("Fallback employee list fetch error:", err);
      }
    }

    // Leave IDs empty so the backend can allocate them without risking a duplicate.
    setEmployeeDetails((prev) => ({
      ...prev,
      emp_no: "",
      epf_no: "",
    }));
  };

  const fetchDepartments = async () => {
    const cmpId =
      localStorage.getItem("cmpnyId") || localStorage.getItem("companyId");
    if (!cmpId) {
      console.error("Company ID not found in local storage");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/department/company/${cmpId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        const departmentList =
          (Array.isArray(data.DepartmentList) && data.DepartmentList) ||
          (Array.isArray(data.UnitList) && data.UnitList) ||
          null;

        if (departmentList) {
          setDepartments(departmentList);
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dptId = parseInt(e.target.value);
    const selectedDepartment = departments.find((dept) => dept.id === dptId);

    if (selectedDepartment) {
      setEmployeeDetails((prev) => ({
        ...prev,
        dptId,
        department: selectedDepartment.dpt_name,
      }));
      setDesignations(selectedDepartment.designationList);
    } else {
      setDesignations([]);
    }
  };

  const handleDesignationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const designationId = parseInt(e.target.value);
    const selectedDesignation = designations.find(
      (desig) => desig.id === designationId,
    );

    if (selectedDesignation) {
      setEmployeeDetails((prev) => ({
        ...prev,
        designationId,
        designation: selectedDesignation.designation,
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEmployeeDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string,
  ) => {
    const file = e.target.files?.[0] || null;
    setDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }));
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingDetailsRef.current) return;
    if (!token) {
      console.error("No token available");
      return;
    }

    const cmpId =
      localStorage.getItem("cmpnyId") || localStorage.getItem("companyId");
    if (!cmpId) {
      console.error("Company ID not found in localStorage");
      return;
    }
    // Comprehensive Validation checks
    if (!employeeDetails.first_name.trim()) {
      toast.error("Please enter first name");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.last_name.trim()) {
      toast.error("Please enter last name");
      setSubmittingDetails(false);
      return;
    }

    if (
      !employeeDetails.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeDetails.email.trim())
    ) {
      toast.error("Please enter a valid email address");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.phone.trim()) {
      toast.error("Please enter phone number");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.nic.trim()) {
      toast.error("Please enter NIC number");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.DOB) {
      toast.error("Please select Date of Birth");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.date_of_joining) {
      toast.error("Please select Date of Joining");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.dptId || employeeDetails.dptId === 0) {
      toast.error("Please select a department");
      setSubmittingDetails(false);
      return;
    }

    if (!employeeDetails.designationId || employeeDetails.designationId === 0) {
      toast.error("Please select a designation");
      setSubmittingDetails(false);
      return;
    }

    if (!isNonNegativeNumber(employeeDetails.basic_salary)) {
      toast.error("Please enter a valid non-negative basic salary");
      setSubmittingDetails(false);
      return;
    }

    let formattedDOB = "";
    let formattedJoiningDate = "";
    try {
      const dobDate = new Date(employeeDetails.DOB);
      if (isNaN(dobDate.getTime())) {
        toast.error("Invalid Date of Birth");
        setSubmittingDetails(false);
        return;
      }
      formattedDOB = dobDate.toISOString().split("T")[0];

      const joinDate = new Date(employeeDetails.date_of_joining);
      if (isNaN(joinDate.getTime())) {
        toast.error("Invalid Date of Joining");
        setSubmittingDetails(false);
        return;
      }
      formattedJoiningDate = joinDate.toISOString().split("T")[0];
    } catch {
      toast.error(
        "Error parsing dates. Please check Date of Birth and Date of Joining.",
      );
      setSubmittingDetails(false);
      return;
    }

    const payload = {
      epf_no: employeeDetails.epf_no,
      emp_no: employeeDetails.emp_no,
      first_name: employeeDetails.first_name,
      last_name: employeeDetails.last_name,
      basic_salary: Number(employeeDetails.basic_salary),
      email: employeeDetails.email.trim(),
      gender: employeeDetails.gender,
      dob: formattedDOB,
      phone: employeeDetails.phone,
      address: employeeDetails.address,
      nic: employeeDetails.nic,
      date_of_joining: formattedJoiningDate,
      cmpId: Number(cmpId),
      dptId: Number(employeeDetails.dptId),
      designationId: Number(employeeDetails.designationId),
    };

    submittingDetailsRef.current = true;
    setSubmittingDetails(true);
    try {
      const response = await fetch(`${API_BASE}/employee/add_employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.resultDesc ||
          `Server error (${response.status}): Failed to save employee details.`;
        console.error(`HTTP ${response.status} Error:`, message);
        toast.error(message);
        return;
      }

      const data = await response.json();
      //console.log("Full response data:", data);

      // Check if we have a successful response
      if (data.response?.resultCode === 100) {
        // The employee ID is inside the Employee object
        const employeeId = data.Employee?.id;

        if (employeeId) {
          setEmpId(employeeId);
          localStorage.setItem("currentEmpId", employeeId.toString());
          //("Employee ID saved:", employeeId);

          if (selectedProfileImage) {
            try {
              const imgFormData = new FormData();
              imgFormData.append("profileImage", selectedProfileImage);
              const imgResponse = await fetch(
                `${API_BASE}/api/profile-image/upload/${employeeId}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  body: imgFormData,
                },
              );
              const imgData = await imgResponse.json();
              if (imgData.resultCode === 100) {
                toast.success("Profile image uploaded successfully!");
              } else {
                toast.error(
                  imgData.resultDesc || "Failed to upload profile image",
                );
              }
            } catch (err) {
              console.error("Error uploading profile image:", err);
              toast.error("Error occurred while uploading profile image");
            }
          }

          if (data.emailSent === false) {
            toast.warning(
              "Employee details saved, but the welcome email could not be sent. Please check the email address or contact your administrator.",
              { autoClose: 8000 },
            );
          } else {
            toast.success("Employee details and welcome email sent successfully!");
          }
          setStep(2);
        } else {
          console.error(
            "Employee saved but ID not found in response. Full response:",
            JSON.stringify(data),
          );
          // alert('Employee saved but there was an issue getting the ID. Please check console for details.');
        }
      } else {
        console.error("API error:", {
          resultCode: data.response?.resultCode,
          resultDesc: data.response?.resultDesc,
        });
        // alert(data.response?.resultDesc || 'Failed to save employee details');
        toast.error(
          data.response?.resultDesc || "Failed to save employee details",
        );
      }
    } catch (error) {
      console.error("Error submitting employee details:", error);
      // alert('Error saving employee details. Please try again.');
      toast.error("Error saving employee details. Please try again.");
    } finally {
      submittingDetailsRef.current = false;
      setSubmittingDetails(false);
    }
  };
  const handleSubmitDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentEmpId = empId || localStorage.getItem("currentEmpId");

    if (!token || !currentEmpId) {
      toast.error(
        "Employee ID not found. Please ensure employee details are saved first.",
      );
      return;
    }
    setSubmittingDocs(true);
    const formData = new FormData();

    // Add empId to FormData
    formData.append("empId", currentEmpId.toString());

    // Append files to FormData with exact field names
    if (documents) {
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });
    }

    // Debug: Log current documents state
    console.log("Current documents state:", documents);

    // Check if we have any files to upload
    const hasFiles =
      documents && Object.values(documents).some((file) => file !== null);

    console.log("Has files:", hasFiles);

    if (!hasFiles) {
      toast.error("Please select at least one document to upload.");
      setSubmittingDocs(false);
      return;
    }

    try {
      // Handle documents using document upload API
      const otherDocsFormData = new FormData();
      let hasOtherFiles = false;

      // Add empId to FormData
      otherDocsFormData.append("empId", currentEmpId.toString());

      if (documents) {
        Object.entries(documents).forEach(([key, file]) => {
          if (file) {
            otherDocsFormData.append(key, file);
            hasOtherFiles = true;
          }
        });
      }

      let documentResponse = null;
      if (hasOtherFiles) {
        documentResponse = await fetch(`${API_BASE}/document/upload-all`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: otherDocsFormData,
        });

        if (!documentResponse.ok) {
          const errorData = await documentResponse.json();
          throw new Error(
            errorData.resultDesc ||
              `Failed to upload documents: ${documentResponse.status}`,
          );
        }
      }

      if (
        (hasOtherFiles && documentResponse?.status === 200) ||
        !hasOtherFiles
      ) {
        toast.success("Documents uploaded successfully!");
        localStorage.removeItem("currentEmpId");
        setStep(1);
        setEmployeeDetails({
          epf_no: "",
          emp_no: "",
          first_name: "",
          last_name: "",
          department: "",
          designation: "",
          basic_salary: "",
          email: "",
          gender: "",
          DOB: "",
          phone: "",
          address: "",
          nic: "",
          date_of_joining: "",
          cmp_id: 0,
          dptId: 0,
          designationId: 0,
        });
        void fetchNextNumbers();
        setDocuments({
          birthCertificate: null,
          cv: null,
          idCopy: null,
          policeReport: null,
          bankPassbook: null,
          appointmentLetter: null,
        });
      } else {
        toast.error(
          `Failed to upload documents: ${documentResponse?.status || "Unknown error"}`,
        );
      }
    } catch (error) {
      toast.error("Error uploading documents. Please try again.");
    } finally {
      setSubmittingDocs(false);
    }
  };

  // Skip button handler
  const handleSkipDocuments = async () => {
    const currentEmpId = empId || localStorage.getItem("currentEmpId");
    if (!token || !currentEmpId) {
      toast.error(
        "Employee ID not found. Please ensure employee details are saved first.",
      );
      return;
    }
    setSubmittingDocs(true);
    const formData = new FormData();
    formData.append("empId", currentEmpId.toString());
    try {
      const response = await fetch(`${API_BASE}/document/upload-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.status === 200) {
        toast.success("Skipped document upload. Employee registered!");
        localStorage.removeItem("currentEmpId");
        setStep(1);
        setEmployeeDetails({
          epf_no: "",
          emp_no: "",
          first_name: "",
          last_name: "",
          department: "",
          designation: "",
          basic_salary: "",
          email: "",
          gender: "",
          DOB: "",
          phone: "",
          address: "",
          nic: "",
          date_of_joining: "",
          cmp_id: 0,
          dptId: 0,
          designationId: 0,
        });
        void fetchNextNumbers();
        setDocuments({
          birthCertificate: null,
          cv: null,
          idCopy: null,
          policeReport: null,
          bankPassbook: null,
          appointmentLetter: null,
        });
      } else {
        const text = await response.text();
        toast.error(
          `Failed to skip document upload: ${response.status} - ${text}`,
        );
      }
    } catch (error) {
      toast.error("Error skipping document upload. Please try again.");
    } finally {
      setSubmittingDocs(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {step === 1 ? (
        <form onSubmit={handleSubmitDetails} className="space-y-6">
          {/* Profile Picture Upload Section */}
          <div className="flex justify-center mb-8">
            <ProfileImageEditor
              employeeId={empId?.toString() || ""}
              token={token || ""}
              gender={
                employeeDetails.gender?.toLowerCase() === "female"
                  ? "female"
                  : "male"
              }
              firstName={employeeDetails.first_name}
              onImageSelected={setSelectedProfileImage}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="EMP Number" />
              </label>
              <input
                type="text"
                name="emp_no"
                value={employeeDetails.emp_no || "(Auto-calculating...)"}
                readOnly
                tabIndex={-1}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 bg-gray-100 text-gray-700 pointer-events-none select-none cursor-default focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="EPF Number" />
              </label>
              <input
                type="text"
                name="epf_no"
                value={employeeDetails.epf_no || "(Auto-calculating...)"}
                readOnly
                tabIndex={-1}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 bg-gray-100 text-gray-700 pointer-events-none select-none cursor-default focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="First Name" />
              </label>
              <input
                type="text"
                name="first_name"
                value={employeeDetails.first_name}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter First Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Last Name" />
              </label>
              <input
                type="text"
                name="last_name"
                value={employeeDetails.last_name}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter Last Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Department" />
              </label>
              <select
                name="department"
                value={employeeDetails.dptId}
                onChange={handleDepartmentChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">
                  <TranslatableOption text="Select Department" />
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.dpt_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Designation" />
              </label>
              <select
                name="designation"
                value={employeeDetails.designationId}
                onChange={handleDesignationChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">
                  <TranslatableOption text="Select Designation" />
                </option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.designation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Basic Salary" />
              </label>
              <LkrInput
                id="employee-basic-salary"
                value={employeeDetails.basic_salary}
                onChange={(value) =>
                  setEmployeeDetails((prev) => ({
                    ...prev,
                    basic_salary: value,
                  }))
                }
                language={language}
                placeholder="Enter basic salary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Email" />
              </label>
              <input
                type="email"
                name="email"
                value={employeeDetails.email}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Gender" />
              </label>
              <select
                name="gender"
                value={employeeDetails.gender}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">
                  <TranslatableOption text="Select Gender" />
                </option>
                <option value="Male">
                  <TranslatableOption text="Male" />
                </option>
                <option value="Female">
                  <TranslatableOption text="Female" />
                </option>
                <option value="Other">
                  <TranslatableOption text="Other" />
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatableText text="Date of Birth" />
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="DOB"
                  value={employeeDetails.DOB}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="mt-1 px-3 pr-10 block w-full h-10 sm:h-11 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-sm sm:text-base transition-colors duration-200 hover:border-gray-400"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Phone" />
              </label>
              <input
                type="tel"
                name="phone"
                value={employeeDetails.phone}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter Phone Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="Address" />
              </label>
              <input
                type="text"
                name="address"
                value={employeeDetails.address}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <TranslatableText text="NIC" />
              </label>
              <input
                type="text"
                name="nic"
                value={employeeDetails.nic}
                onChange={handleInputChange}
                className="mt-1 px-3 block w-full h-10 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter NIC Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <TranslatableText text="Date of Joining" />
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date_of_joining"
                  value={employeeDetails.date_of_joining}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="mt-1 px-3 pr-10 block w-full h-10 sm:h-11 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-sm sm:text-base transition-colors duration-200 hover:border-gray-400"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 hover:scale-105 flex items-center justify-center disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={submittingDetails}
            >
              {submittingDetails ? (
                <>
                  <Loading
                    size="xs"
                    color="border-white"
                    className="inline mr-2"
                  />
                  <span>Loading...</span>
                </>
              ) : (
                <TranslatableText text="Next" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmitDocuments} className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <TranslatableText text="Please Upload below documents" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "birthCertificate",
                label: "Birth Certificate",
                accept: ".pdf",
              },
              { name: "cv", label: "CV", accept: ".pdf" },
              { name: "idCopy", label: "ID Copy", accept: ".pdf" },
              { name: "policeReport", label: "Police Report", accept: ".pdf" },
              {
                name: "bankPassbook",
                label: "Bank Passbook Front Page",
                accept: ".pdf",
              },
              {
                name: "appointmentLetter",
                label: "Appointment Letter",
                accept: ".pdf",
              },
            ].map((doc) => (
              <div key={doc.name}>
                <label className="block text-sm font-medium text-gray-700">
                  <TranslatableText text={doc.label} />{" "}
                  <span className="text-red-600">*</span>
                </label>
                <div className="mt-1 flex items-center">
                  <label className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <TranslatableText text="Choose File" />
                    <input
                      type="file"
                      className="hidden"
                      accept={doc.accept}
                      onChange={(e) => handleFileChange(e, doc.name)}
                    />
                  </label>
                </div>
                {documents[doc.name as keyof Document] && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected file: {documents[doc.name as keyof Document]?.name}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 hover:scale-105 flex items-center justify-center disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={submittingDocs}
            >
              {submittingDocs ? (
                <>
                  <Loading
                    size="xs"
                    color="border-white"
                    className="inline mr-2"
                  />
                  <span>Loading...</span>
                </>
              ) : (
                <TranslatableText text="Submit Documents" />
              )}
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 hover:scale-105 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={submittingDocs}
              onClick={handleSkipDocuments}
            >
              {submittingDocs ? (
                <>
                  <Loading
                    size="xs"
                    color="border-white"
                    className="inline mr-2"
                  />
                  <span>Loading...</span>
                </>
              ) : (
                <TranslatableText text="Skip" />
              )}
            </button>
          </div>
        </form>
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default EmployeeRegistration;
