import React, { useState, useEffect } from "react";
import Table from "../../components/table/Table";
import { User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Attendance {
  id: number;
  startedAt: string;
  endedAt: string | null;
  workingStatus: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  epfNo: string;
  department: {
    dpt_name: string;
  };
  attendanceList: Attendance[];
}

interface ApiResponse {
  resultCode: number;
  resultDesc: string;
  EmployeeList: Employee[];
}

interface AttendanceRequest {
  startedAt: string;
  endedAt: string | null;
  empId: number;
  working_status: "On-Site" | "Online";
}

const AttendanceMarkTable = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [attendanceStatus, setAttendanceStatus] = useState<{
    [key: number]: "On-Site" | "Online";
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Helper function to get local time in simple ISO format (no timezone)
  const getLocalTimeISO = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("cmpnyId");

        if (!token || !companyId) {
          throw new Error("No token or company ID found");
        }

        const response = await fetch(
          `http://localhost:8080/employee/lastattendanceList/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Treat 404 as "no employees" rather than an error
            setEmployees([]);
            return;
          }
          throw new Error("Failed to fetch employees");
        }

        const data: ApiResponse = await response.json();
        if (data.resultCode === 100) {
          const list = data.EmployeeList || [];
          setEmployees(list);
          if (list.length > 0) {
            await fetchEmployeePhotos(list, token);
          }
        } else {
          throw new Error(data.resultDesc);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // no-op
        }
      });
    };
  }, [photoUrls]);

  const fetchEmployeePhotos = async (employeeList: Employee[], token: string) => {
    // Cleanup previous URLs
    Object.values(photoUrls).forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // no-op
      }
    });

    const photoUrlMap: Record<number, string> = {};

    await Promise.all(
      employeeList.map(async (employee) => {
        try {
          const existsResp = await fetch(
            `http://localhost:8080/api/profile-image/exists/${employee.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!existsResp.ok) return;
          const existsData: { hasProfileImage?: boolean; exists?: boolean } =
            await existsResp.json();
          const hasImage = Boolean(
            existsData?.hasProfileImage ?? existsData?.exists
          );
          if (!hasImage) return;

          const imgResp = await fetch(
            `http://localhost:8080/api/profile-image/view/${employee.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!imgResp.ok) return;
          const blob = await imgResp.blob();
          if (!blob || blob.size === 0) return;
          photoUrlMap[employee.id] = URL.createObjectURL(blob);
        } catch {
          // ignore photo failures; keep fallback avatar
        }
      })
    );

    setPhotoUrls(photoUrlMap);
  };

  const handleAttendanceStatusChange = (
    empId: number,
    status: "On-Site" | "Online",
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setAttendanceStatus((prev) => ({
      ...prev,
      [empId]: status,
    }));
  };

  const handleMarkAttendance = async (
    empId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    const status = attendanceStatus[empId] || "On-Site";

    toast.info(
      <div>
        <p>
          Are you sure you want to mark attendance as <strong>{status}</strong>?
        </p>
        <div className="flex justify-end mt-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
            onClick={async () => {
              toast.dismiss();
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  throw new Error("No token found");
                }

                const attendanceData: AttendanceRequest = {
                  startedAt: getLocalTimeISO(),
                  endedAt: null,
                  empId: empId,
                  working_status: status,
                };

                const response = await fetch(
                  "http://localhost:8080/attendance/add_attendance",
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(attendanceData),
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to mark attendance");
                }

                toast.success("Attendance marked successfully!");
                setLoading(true);
                fetchEmployees();
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Failed to mark attendance"
                );
              }
            }}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  const handleEndDate = async (
    attendanceId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    toast.info(
      <div>
        <p>Are you sure you want to end the attendance?</p>
        <div className="flex justify-end mt-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
            onClick={async () => {
              toast.dismiss();
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  throw new Error("No token found");
                }

                const updateData = {
                  endedAt: getLocalTimeISO(),
                };

                const response = await fetch(
                  `http://localhost:8080/attendance/update/${attendanceId}`,
                  {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updateData),
                  }
                );

                if (!response.ok) {
                  throw new Error("Failed to update end time");
                }

                toast.success("End time recorded successfully!");
                setLoading(true);
                fetchEmployees();
              } catch (err) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Failed to update end time"
                );
              }
            }}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("cmpnyId");

      if (!token || !companyId) {
        throw new Error("No token or company ID found");
      }

      const response = await fetch(
        `http://localhost:8080/employee/lastattendanceList/${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setEmployees([]);
          return;
        }
        throw new Error("Failed to fetch employees");
      }

      const data: ApiResponse = await response.json();
      if (data.resultCode === 100) {
        const list = data.EmployeeList || [];
        setEmployees(list);
        if (list.length > 0) {
          await fetchEmployeePhotos(list, token);
        }
      } else {
        throw new Error(data.resultDesc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveAttendance = (employee: Employee): Attendance | null => {
    if (employee.attendanceList && employee.attendanceList.length > 0) {
      const latestAttendance = employee.attendanceList[0];
      if (latestAttendance.startedAt && latestAttendance.endedAt === null) {
        return latestAttendance;
      }
    }
    return null;
  };

  const columns = [
    {
      key: "photo",
      title: "Photo",
      render: (item: Employee) => {
        const imageUrl = photoUrls[item.id] || null;
        return (
          <div className="flex items-center justify-center w-10 h-10">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${item.firstName} ${item.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => {
                  setPhotoUrls((prev) => {
                    const next = { ...prev };
                    const existing = next[item.id];
                    if (existing) {
                      try {
                        URL.revokeObjectURL(existing);
                      } catch {
                        // no-op
                      }
                      delete next[item.id];
                    }
                    return next;
                  });
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={16} className="text-gray-500" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      title: "Name",
      render: (item: Employee) => (
        <span className="text-xs">{`${item.firstName} ${item.lastName}`}</span>
      ),
    },
    {
      key: "epfNo",
      title: "Employee ID",
      render: (item: Employee) => <span className="text-xs">{item.epfNo}</span>,
    },
    {
      key: "department",
      title: "Department",
      render: (item: Employee) => (
        <span className="text-xs">{item.department.dpt_name}</span>
      ),
    },
    {
      key: "attendanceStatus",
      title: "Attendance Status",
      render: (item: Employee) => {
        const activeAttendance = hasActiveAttendance(item);
        return activeAttendance ? (
          <span className="text-xs text-green-600">Working On</span>
        ) : (
          <select
            className="p-1 border rounded-md text-xs"
            value={attendanceStatus[item.id] || "On-Site"}
            onChange={(e) =>
              handleAttendanceStatusChange(
                item.id,
                e.target.value as "On-Site" | "Online",
                e as unknown as React.MouseEvent
              )
            }
            onClick={(e) => e.stopPropagation()}
          >
            <option value="On-Site">On-Site</option>
            <option value="Online">Online</option>
          </select>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (item: Employee) => {
        const activeAttendance = hasActiveAttendance(item);
        return activeAttendance ? (
          <button
            onClick={(e) => handleEndDate(activeAttendance.id, e)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
            aria-label="End Date"
          >
            <span className="text-xs text-red-600">End Date</span>
          </button>
        ) : (
          <button
            onClick={(e) => handleMarkAttendance(item.id, e)}
            className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
            aria-label="Mark Attendance"
          >
            <span className="text-xs text-green-600">Mark Attendance</span>
          </button>
        );
      },
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
            fetchEmployees();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-700">
            No employees found
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Add an employee to start marking attendance.
          </p>
          <button
            className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            onClick={() => (window.location.href = "/employee/new")} // Adjust the route as needed
          >
            Add Employee
          </button>
          <ToastContainer />
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const paginatedData = employees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="p-6">
      <Table
        columns={columns}
        data={paginatedData}
        title="Attendance"
        searchKeys={["firstName", "lastName", "epfNo", "department.dpt_name"]}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
      <ToastContainer />
    </div>
  );
};

export default AttendanceMarkTable;
