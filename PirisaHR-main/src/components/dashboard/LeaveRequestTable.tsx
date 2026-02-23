import React, { useState } from "react";
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
  avatar?: string;
  initials?: string;
  name: string;
  leaveFrom: string;
  leaveTo: string;
  status: "Pending" | "Approved" | "Reject";
}

const LeaveRequestTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Example data
  const data: LeaveRequest[] = [
    {
      id: "1",
      avatar: "/api/placeholder/32/32",
      name: "Tanner Finsha",
      leaveFrom: "10.12.2024",
      leaveTo: "12.12.2024",
      status: "Pending",
    },
    {
      id: "2",
      avatar: "/api/placeholder/32/32",
      name: "Tanner Finsha",
      leaveFrom: "10.12.2024",
      leaveTo: "12.12.2024",
      status: "Approved",
    },
    {
      id: "3",
      avatar: "/api/placeholder/32/32",
      name: "Tanner Finsha",
      leaveFrom: "10.12.2024",
      leaveTo: "12.12.2024",
      status: "Reject",
    },
  ];

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
        return (
          <div className="flex items-center gap-3">
            {request.avatar ? (
              <img
                src={request.avatar}
                alt={request.name}
                className="w-8 h-8 rounded-full"
              />
            ) : request.initials ? (
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-medium">
                {request.initials}
              </div>
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
              className={`p-1 rounded ${
                request.status === "Approved"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
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
