import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../table/Table";
import { Trash2 } from "lucide-react";
import DateFilter from "../Filters/DateFilter"; // Import the DateFilter component

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface Attendance {
  id: number;
  firstName: string;
  lastName: string;
  epfNo: string;
  email: string;
  gender: string;
  phone: string;
  address: string;
  dateOfJoining: string;
  nic: string;
  dob: string;
  status: string;
  basicSalary: number;
  photo?: {
    photoUrl?: string;
  };
  attendanceList: {
    id: number;
    startedAt: string;
    endedAt: string;
    working_status: string;
  }[];
}

interface ApiResponse {
  resultCode: number;
  resultDesc: string;
  EmployeeList: Attendance[];
}

const AttendanceTable = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>(
    []
  );
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const rowsPerPage = 10;
  const navigate = useNavigate();

  // Cleanup photo URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [photoUrls]);

  const fetchEmployeePhotos = async (
    employeeList: Attendance[],
    token: string
  ) => {
    const photoPromises = employeeList.map(async (employee) => {
      try {
        const existsResp = await fetch(
          `http://localhost:8080/api/profile-image/exists/${employee.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!existsResp.ok) return { id: employee.id, url: null };
        const existsData: { hasProfileImage?: boolean; exists?: boolean } =
          await existsResp.json();
        const hasImage = Boolean(
          existsData?.hasProfileImage ?? existsData?.exists
        );
        if (!hasImage) return { id: employee.id, url: null };

        const photoResponse = await fetch(
          `http://localhost:8080/api/profile-image/view/${employee.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!photoResponse.ok) {
          return { id: employee.id, url: null };
        }

        const blob = await photoResponse.blob();
        if (!blob || blob.size === 0) {
          return { id: employee.id, url: null };
        }

        const imageUrl = URL.createObjectURL(blob);
        return { id: employee.id, url: imageUrl };
      } catch (_error) {
        return { id: employee.id, url: null };
      }
    });

    const photoResults = await Promise.all(photoPromises);
    const photoUrlMap: Record<number, string> = {};

    photoResults.forEach(({ id, url }) => {
      if (url) {
        photoUrlMap[id] = url;
      }
    });

    setPhotoUrls(photoUrlMap);
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("cmpnyId");

        if (!token || !companyId) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/employee/attendanceList/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            navigate("/login");
            return;
          }
          if (response.status === 404) {
            // Treat 404 as "no attendance records" rather than an error
            setAttendance([]);
            setFilteredAttendance([]);
            return;
          }
          throw new Error("Failed to fetch attendance");
        }

        const data: ApiResponse = await response.json();
        if (data.resultCode === 100) {
          const employeeList = data.EmployeeList || [];
          setAttendance(employeeList);
          setFilteredAttendance(employeeList); // Initialize filtered data

          if (employeeList.length > 0) {
            await fetchEmployeePhotos(employeeList, token);
          }
        } else {
          setAttendance([]);
          setFilteredAttendance([]);
          throw new Error(data.resultDesc);
        }
      } catch (error) {
        setAttendance([]);
        setFilteredAttendance([]);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [navigate]);

  useEffect(() => {
    if (selectedDate && attendance.length > 0) {
      const filtered = attendance.map((emp) => ({
        ...emp,
        attendanceList: emp.attendanceList.filter(
          (att) =>
            new Date(att.startedAt).toISOString().split("T")[0] === selectedDate
        ),
      }));
      setFilteredAttendance(filtered);
    }
  }, [attendance, selectedDate]);

  // Handle date filter change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (date) {
      const filtered = attendance.map((emp) => ({
        ...emp,
        attendanceList: emp.attendanceList.filter(
          (att) => new Date(att.startedAt).toISOString().split("T")[0] === date
        ),
      }));
      setFilteredAttendance(filtered);
    } else {
      setFilteredAttendance(attendance); // Reset to all data if no date is selected
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("cmpnyId");

      if (!token || !companyId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/attendance/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete attendance");
      }

      setAttendance((prevAttendance) =>
        prevAttendance.filter((att) => att.id !== id)
      );
      setFilteredAttendance((prev) => prev.filter((att) => att.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const totalPages = Math.ceil((filteredAttendance?.length || 0) / rowsPerPage);

  const paginatedData = Array.isArray(filteredAttendance)
    ? filteredAttendance.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      )
    : [];

  const columns: Column<Attendance>[] = [
    {
      key: "photo",
      title: "Photo",
      render: (item) => (
        <div className="flex items-center justify-center">
          {photoUrls[item.id] ? (
            <img
              src={photoUrls[item.id]}
              alt={`${item.firstName} ${item.lastName}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=6366f1&color=fff&size=40`;
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {item.firstName.charAt(0)}
                {item.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      title: "Name",
      render: (item) => (
        <span className="text-xs">{`${item.firstName} ${item.lastName}`}</span>
      ),
    },
    {
      key: "epfNo",
      title: "EPF No",
      render: (item) => <span className="text-xs">{item.epfNo}</span>,
    },
    {
      key: "startedAt",
      title: "Started At",
      render: (item) => (
        <div className="space-y-1">
          {item.attendanceList.map((att, index) => (
            <div key={`${att.id}-${index}`} className="text-xs">
              {new Date(att.startedAt).toLocaleString()}
            </div>
          ))}
          {item.attendanceList.length === 0 && (
            <span className="text-xs text-gray-500">No records</span>
          )}
        </div>
      ),
    },
    {
      key: "endedAt",
      title: "Ended At",
      render: (item) => (
        <div className="space-y-1">
          {item.attendanceList.map((att, index) => (
            <div key={`${att.id}-${index}`} className="text-xs">
              {att.endedAt
                ? new Date(att.endedAt).toLocaleString()
                : "In Working"}
            </div>
          ))}
          {item.attendanceList.length === 0 && (
            <span className="text-xs text-gray-500">No records</span>
          )}
        </div>
      ),
    },
    {
      key: "workingStatus",
      title: "Working Status",
      render: (item) => (
        <div className="space-y-1">
          {item.attendanceList.map((att) => (
            <div key={att.id} className="text-xs">
              {att.working_status}
            </div>
          ))}
          {item.attendanceList.length === 0 && (
            <span className="text-xs text-gray-500">No records</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (item) => (
        <span
          className={`px-2 text-xs py-0.5 rounded-full ${
            item.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDelete(item.id)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          onClick={() => {
            setError("");
            setLoading(true);
            const fetchAttendance = async () => {
              try {
                const token = localStorage.getItem("token");
                const companyId = localStorage.getItem("cmpnyId");

                if (!token || !companyId) {
                  navigate("/login");
                  return;
                }

                const response = await fetch(
                  `http://localhost:8080/employee/attendanceList/${companyId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (!response.ok) {
                  if (response.status === 401) {
                    navigate("/login");
                    return;
                  }
                  if (response.status === 404) {
                    setAttendance([]);
                    setFilteredAttendance([]);
                    return;
                  }
                  throw new Error("Failed to fetch attendance");
                }

                const data: ApiResponse = await response.json();
                if (data.resultCode === 100) {
                  setAttendance(data.EmployeeList || []);
                  setFilteredAttendance(data.EmployeeList || []);
                } else {
                  setAttendance([]);
                  setFilteredAttendance([]);
                  throw new Error(data.resultDesc);
                }
              } catch (error) {
                setAttendance([]);
                setFilteredAttendance([]);
                setError(
                  error instanceof Error
                    ? error.message
                    : "An unknown error occurred"
                );
              } finally {
                setLoading(false);
              }
            };
            fetchAttendance();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Check if filteredAttendance is empty or all employees have no attendance records for the selected date
  const hasAttendanceRecords = filteredAttendance.some(
    (emp) => emp.attendanceList.length > 0
  );

  if (!hasAttendanceRecords) {
    return (
      <div className="p-6">
        <DateFilter onDateChange={handleDateChange} />
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-700">
            No attendance records found
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {selectedDate
              ? `No attendance records for ${new Date(
                  selectedDate
                ).toLocaleDateString()}.`
              : "Please select a date to view attendance records."}
          </p>
          <button
            className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            onClick={() => navigate("/attendance/mark")} // Adjust the route as needed
          >
            Add Attendance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DateFilter onDateChange={handleDateChange} />
      <Table
        columns={columns}
        data={paginatedData}
        title="Attendance List"
        searchKeys={[
          "firstName",
          "lastName",
          "epfNo",
          "email",
          "attendanceList.working_status",
        ]}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
};

export default AttendanceTable;
