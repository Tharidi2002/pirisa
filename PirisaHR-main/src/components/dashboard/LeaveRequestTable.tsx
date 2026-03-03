import React, { useEffect, useMemo, useState } from "react";
import Table from "../table/Table";
import { Check, X } from "lucide-react";

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface LeaveRequest {
  id: string;
  empId: number;
  name: string;
  leaveFrom: string;
  leaveTo: string;
  status: "Pending" | "Approved" | "Reject";
}

interface EmpDetailsLeaveDTO {
  id: number;
  leaveType: string;
  leaveReason: string;
  leaveStatus: string;
  leaveStartDay: string;
  leaveEndDay: string;
  leaveDays: number;
}

interface EmpDetailsDTO {
  id: number;
  firstName: string;
  lastName: string;
  leaveList?: EmpDetailsLeaveDTO[];
}

const LeaveRequestTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [employees, setEmployees] = useState<EmpDetailsDTO[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => {
        if (url) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // no-op
          }
        }
      });
    };
  }, [photoUrls]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cmpnyId = localStorage.getItem("cmpnyId");
    if (!token || !cmpnyId) {
      setEmployees([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/employee/PendingEmpDetailsList/${cmpnyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          setEmployees([]);
          return;
        }

        const json = await res.json();
        if (json?.resultCode === 100 && Array.isArray(json?.EmployeeList)) {
          setEmployees(json.EmployeeList);
        } else {
          setEmployees([]);
        }
      } catch {
        setEmployees([]);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const empIds = employees
      .map((e) => e.id)
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

    if (empIds.length === 0) {
      setPhotoUrls({});
      return;
    }

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        empIds.map(async (empId) => {
          try {
            const existsResp = await fetch(
              `http://localhost:8080/api/profile-image/exists/${empId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!existsResp.ok) return { empId, url: null as string | null };
            const existsData: { hasProfileImage?: boolean; exists?: boolean } =
              await existsResp.json();
            const hasImage = Boolean(
              existsData?.hasProfileImage ?? existsData?.exists
            );
            if (!hasImage) return { empId, url: null as string | null };

            const imgResp = await fetch(
              `http://localhost:8080/api/profile-image/view/${empId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!imgResp.ok) return { empId, url: null as string | null };
            const blob = await imgResp.blob();
            if (!blob || blob.size === 0) {
              return { empId, url: null as string | null };
            }
            return { empId, url: URL.createObjectURL(blob) };
          } catch {
            return { empId, url: null as string | null };
          }
        })
      );

      if (cancelled) {
        results.forEach((r) => {
          if (r.url) {
            try {
              URL.revokeObjectURL(r.url);
            } catch {
              // no-op
            }
          }
        });
        return;
      }

      setPhotoUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url) {
            try {
              URL.revokeObjectURL(url);
            } catch {
              // no-op
            }
          }
        });

        const map: Record<number, string> = {};
        results.forEach((r) => {
          if (r.url) map[r.empId] = r.url;
        });
        return map;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [employees]);

  const data: LeaveRequest[] = useMemo(() => {
    const formatDateOnly = (value?: string) => {
      if (!value) return "";
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
    };

    const statusMap = (status?: string): LeaveRequest["status"] => {
      const s = (status || "").toUpperCase();
      if (s === "APPROVED") return "Approved";
      if (s === "REJECT" || s === "REJECTED") return "Reject";
      return "Pending";
    };

    const rows: LeaveRequest[] = [];
    for (const emp of employees) {
      const leaves = Array.isArray(emp.leaveList) ? emp.leaveList : [];
      for (const leave of leaves) {
        const mappedStatus = statusMap(leave.leaveStatus);
        if (mappedStatus !== "Pending") continue;
        rows.push({
          id: String(leave.id),
          empId: emp.id,
          name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "-",
          leaveFrom: formatDateOnly(leave.leaveStartDay),
          leaveTo: formatDateOnly(leave.leaveEndDay),
          status: mappedStatus,
        });
      }
    }
    return rows;
  }, [employees]);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Create empty rows to fill the remaining space
  // const emptyRows = Array(rowsPerPage - data.length).fill(null).map((_, index) => ({
  //   id: `empty-${index}`,
  //   name: "",
  //   leaveFrom: "",
  //   leaveTo: "",
  //   status: "" as "Pending" | "Approved" | "Reject", // Empty status for empty rows
  // }));

  // // Combine actual data with empty rows
  // const currentData = [...data, ...emptyRows];

  const getStatusColor = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-600";
      case "Approved":
        return "bg-green-100 text-green-600";
      case "Reject":
        return "bg-red-100 text-red-600";
      default:
        return "";
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: "name",
      title: "Name",
      render: (request: LeaveRequest) => {
        if (!request.name) return <div className="h-8"></div>; // Empty space for empty rows
        const imgUrl = photoUrls[request.empId];
        return (
          <div className="flex items-center gap-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={request.name}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100"></div>
            )}
            <span className="font-medium text-gray-900">{request.name}</span>
          </div>
        );
      },
    },
    {
      key: "leaveFrom",
      title: "Leave From",
      className: "text-gray-600",
      render: (request: LeaveRequest) => {
        if (!request.leaveFrom) return <div className="h-8"></div>;
        return request.leaveFrom;
      }
    },
    {
      key: "leaveTo",
      title: "Leave To",
      className: "text-gray-600",
      render: (request: LeaveRequest) => {
        if (!request.leaveTo) return <div className="h-8"></div>;
        return request.leaveTo;
      }
    },
    {
      key: "status",
      title: "Status",
      render: (request: LeaveRequest) => {
        if (!request.status) return <div className="h-8"></div>;
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              request.status
            )}`}
          >
            {request.status}
          </span>
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (request: LeaveRequest) => {
        if (!request.status) return <div className="h-8"></div>;
        return (
          <div className="flex gap-2">
            <button
              type="button"
              className={`p-1 rounded ${
                request.status === "Approved"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              className={`p-1 rounded ${
                request.status === "Reject"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        data={data}
        title="Leave Requests"
        rowClickable={false}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
};

export default LeaveRequestTable;
