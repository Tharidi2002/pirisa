// EmployeeProfile.tsx
import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaIdCard,
  FaBriefcase,
  FaMoneyBillWave,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaVenusMars,
  FaCalendarAlt,
} from "react-icons/fa";
import Loading from "../../components/Loading/Loading";
import { DocumentCard } from "../../EmployeeFolder/EmployeeProfile/DocumentCard ";
import { InfoItem } from "../../EmployeeFolder/EmployeeProfile/InfoItem";
import { LeaveBalanceCard } from "../../EmployeeFolder/EmployeeProfile/LeaveBalanceCard ";
import { ProfileCard } from "../../EmployeeFolder/EmployeeProfile/ProfileCard";

interface EmployeeDetails {
  id: number;
  epf_no: string;
  first_name: string;
  last_name: string;
  basic_salary: number;
  email: string;
  gender: string;
  phone: string;
  address: string;
  date_of_joining: string;
  department: {
    dpt_name: string;
  };
  designation: {
    designation: string;
  };
}

interface CompanyLeave {
  id: number;
  leaveType: string;
  amount: number;
  cmpId: number;
}

interface EmployeeLeave {
  id: number;
  leaveType: string;
  leaveReason: string;
  leaveStatus: string;
  leaveStartDay: string;
  leaveEndDay: string;
  leaveDays: number;
}

interface LeaveBalance {
  leaveType: string;
  available: number;
  taken: number;
}

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [documentAvailability, setDocumentAvailability] = useState<
    Record<string, boolean>
  >({});
  // const navigate = useNavigate();

  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const empId = localStorage.getItem("empId");
    const cmpId = localStorage.getItem("cmpnyId"); // Assuming you store company ID in localStorage

    if (!token || !empId || !cmpId) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      let companyLeaveData = { LeavetList: [] };
      try {
        const companyLeaveResponse = await fetch(
          `http://64.227.152.179:8080/HRM-1/company_leave/company/${cmpId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (companyLeaveResponse.ok) {
          const fetchedData = await companyLeaveResponse.json();
          if (fetchedData.resultCode === 100 && fetchedData.LeavetList) {
            companyLeaveData = fetchedData;
          }
        }
        // If not ok or resultCode is not 100, we'll just use the empty LeavetList
      } catch (leaveError) {
        console.error(
          "Could not fetch company leave data, proceeding without it:",
          leaveError
        );
        // Proceed with empty companyLeaveData.LeavetList
      }

      // Fetch employee details including leave history
      const employeeResponse = await fetch(
        `http://64.227.152.179:8080/HRM-1/employee/EmpDetailsListByEmp/${empId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!employeeResponse.ok) {
        throw new Error("Failed to fetch employee data");
      }

      const employeeData = await employeeResponse.json();
      if (employeeData.resultCode !== 100 || !employeeData.EmployeeLeaveList) {
        throw new Error(employeeData.resultDesc || "No employee data found");
      }

      const employeeDetails = employeeData.EmployeeLeaveList[0];
      setEmployee({
        id: employeeDetails.id,
        epf_no: employeeDetails.epfNo,
        first_name: employeeDetails.firstName,
        last_name: employeeDetails.lastName,
        basic_salary: employeeDetails.basicSalary,
        email: employeeDetails.email,
        gender: employeeDetails.gender,
        phone: employeeDetails.phone,
        address: employeeDetails.address,
        date_of_joining: employeeDetails.dateOfJoining,
        department: employeeDetails.department,
        designation: employeeDetails.designation,
      });

      // Calculate leave balances
      const balances = calculateLeaveBalances(
        companyLeaveData.LeavetList,
        employeeDetails.leaveList || []
      );
      setLeaveBalances(balances);

      // Check document availability
      await checkDocumentAvailability(empId, token);

      // Fetch employee photo
      const photoResponse = await fetch(
        `http://64.227.152.179:8080/HRM-1/document/view/emp/${empId}/photo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (photoResponse.ok) {
        const blob = await photoResponse.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPhotoUrl(imageUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDocumentAvailability = async (empId: string, token: string) => {
    const documentTypes = [
      "birthCertificate",
      "cv",
      "policeReport",
      "idCopy",
      "bankPassbook",
      "appointmentLetter",
      "photo",
    ];
    const availability: Record<string, boolean> = {};

    for (const docType of documentTypes) {
      try {
        const response = await fetch(
          `http://64.227.152.179:8080/HRM-1/document/view/emp/${empId}/${docType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        availability[docType] = response.ok;
      } catch {
        availability[docType] = false;
      }
    }

    setDocumentAvailability(availability);
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const handleDocumentView = async (documentType: string) => {
    try {
      const token = localStorage.getItem("token");
      const empId = localStorage.getItem("empId");

      if (!token || !empId) {
        throw new Error("Authentication required");
      }

      const url = `http://64.227.152.179:8080/HRM-1/document/view/emp/${empId}/${documentType}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to view document");
    }
  };

  const documents = [
    { name: "Birth Certificate", type: "birthCertificate" },
    { name: "CV", type: "cv" },
    { name: "Police Report", type: "policeReport" },
    { name: "ID Copy", type: "idCopy" },
    { name: "Bank Details", type: "bankPassbook" },
    { name: "Appointment Letter", type: "appointmentLetter" },
    { name: "Photo", type: "photo" },
  ];

  if (loading) return <LoadingPage />;
  if (error) return <ErrorPage error={error} />;
  if (!employee) return <NoDataPage />;

  return (
    <div className="min-h-screen p-6">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <ProfileCard
          photoUrl={photoUrl || "/profile.jpg"}
          firstName={employee.first_name}
          lastName={employee.last_name}
          designation={employee.designation.designation}
          onPhotoUploaded={fetchEmployeeData}
        />

        {/* Employee Info */}
        <div className="w-full lg:w-2/3 bg-gray-50 p-6 rounded-lg shadow-md transition hover:shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<FaUser />}
              label="Full Name"
              value={`${employee.first_name} ${employee.last_name}`}
            />
            <InfoItem
              icon={<FaIdCard />}
              label="Employee ID"
              value={employee.epf_no}
            />
            <InfoItem
              icon={<FaBriefcase />}
              label="Department"
              value={employee.department.dpt_name}
            />
            <InfoItem
              icon={<FaBriefcase />}
              label="Designation"
              value={employee.designation.designation}
            />
            <InfoItem
              icon={<FaMoneyBillWave />}
              label="Basic Salary"
              value={employee.basic_salary.toLocaleString()}
            />
            <InfoItem
              icon={<FaVenusMars />}
              label="Gender"
              value={employee.gender}
            />
            <InfoItem
              icon={<FaEnvelope />}
              label="Email"
              value={employee.email}
            />
            <InfoItem icon={<FaPhone />} label="Phone" value={employee.phone} />
            <InfoItem
              icon={<FaMapMarkerAlt />}
              label="Address"
              value={employee.address}
            />
            <InfoItem
              icon={<FaCalendarAlt />}
              label="Joined Date"
              value={employee.date_of_joining}
            />
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <Section title="Documents">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <DocumentCard
              key={index}
              name={doc.name}
              type={doc.type}
              onClick={handleDocumentView}
              isAvailable={documentAvailability[doc.type] || false}
              onDocumentUploaded={fetchEmployeeData}
            />
          ))}
        </div>
      </Section>

      {/* Leave Balance Section */}
      <Section title="Leave Balance">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {leaveBalances.length > 0 ? (
            leaveBalances.map((balance, index) => (
              <LeaveBalanceCard
                key={index}
                title={balance.leaveType}
                available={balance.available}
                taken={balance.taken}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No leave types configured for this company
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Contact your administrator to set up leave types
              </p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

// Helper components for rendering states
const LoadingPage = () => (
  <div className="flex justify-center items-center h-64">
    <Loading size="lg" />
  </div>
);

const ErrorPage = ({ error }: { error: string }) => (
  <div className="flex justify-center items-center h-64">
    <div className="text-red-500">{error}</div>
  </div>
);

const NoDataPage = () => (
  <div className="flex justify-center items-center h-64">
    <div>No employee data found</div>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md transition hover:shadow-lg">
    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-400 pb-2 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const calculateLeaveBalances = (
  companyLeaves: CompanyLeave[],
  employeeLeaves: EmployeeLeave[]
): LeaveBalance[] => {
  return companyLeaves.map((companyLeave) => {
    const takenLeaves = employeeLeaves
      .filter(
        (leave) =>
          leave.leaveType === companyLeave.leaveType &&
          leave.leaveStatus === "APPROVED"
      )
      .reduce((sum, leave) => sum + leave.leaveDays, 0);

    return {
      leaveType: companyLeave.leaveType,
      available: companyLeave.amount,
      taken: takenLeaves,
    };
  });
};

export default EmployeeProfile;
