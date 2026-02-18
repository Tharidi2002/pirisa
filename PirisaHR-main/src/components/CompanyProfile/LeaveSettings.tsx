import React, { useState, useEffect, ChangeEvent } from "react";
import { FaEdit, FaSave, FaPlus, FaCalendarAlt, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../Loading/Loading"; // Adjust the path as needed

// Define types
interface LeaveType {
  id: number;
  leaveType: string;
  amount: number;
  cmpId: number;
}

interface EditFormData {
  leaveType: string;
  amount: number;
}

const LeaveSettings: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    leaveType: "",
    amount: 0,
  });
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newLeaveType, setNewLeaveType] = useState<EditFormData>({
    leaveType: "",
    amount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true); // Loading state for fetching data
  const [savingEdit, setSavingEdit] = useState<boolean>(false); // Loading state for editing
  const [savingNew, setSavingNew] = useState<boolean>(false); // Loading state for adding new

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3); // Number of items per page

  // Fetch leave types from API
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      const cmpId = localStorage.getItem("cmpnyId"); // Get company ID from localStorage
      const token = localStorage.getItem("token"); // Get token from localStorage

      if (!cmpId || !token) {
        toast.error("Missing company ID or token. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://64.227.152.179:8080/HRM-1/company_leave/company/${cmpId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch leave types: ${response.statusText}`
          );
        }

        const data = await response.json();
        //console.log("API Response:", data); // Debug log
        if (data.resultCode === 100 && Array.isArray(data.LeavetList)) {
          setLeaveTypes(data.LeavetList);
        } else {
          throw new Error("Unexpected response format or result code");
        }
      } catch (error) {
        console.error("Error fetching leave types:", error);
        // toast.error("Failed to fetch leave types. Please try again.");
        setLeaveTypes([]); // Ensure state is reset on error
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  // Handle clicking on a leave type to edit
  const handleEditClick = (leaveType: LeaveType): void => {
    setEditingId(leaveType.id);
    setEditFormData({
      leaveType: leaveType.leaveType,
      amount: leaveType.amount,
    });
  };

  // Handle input changes while editing
  const handleEditChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  // Handle saving edited leave type
  const handleSaveClick = async (): Promise<void> => {
    const cmpId = localStorage.getItem("cmpnyId"); // Get company ID from localStorage
    const token = localStorage.getItem("token"); // Get token from localStorage

    if (!cmpId || !token) {
      toast.error("Missing company ID or token. Please log in again.");
      return;
    }

    setSavingEdit(true);
    try {
      const response = await fetch(
        `http://64.227.152.179:8080/HRM-1/company_leave/update_leave`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editingId,
            leaveType: editFormData.leaveType,
            amount: editFormData.amount,
            cmpId: cmpId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update leave type");
      }

      const updatedLeaveTypes = leaveTypes.map((leaveType) =>
        leaveType.id === editingId
          ? { ...leaveType, ...editFormData }
          : leaveType
      );
      setLeaveTypes(updatedLeaveTypes);
      setEditingId(null);
      toast.success("Leave type updated successfully!");
    } catch (error) {
      console.error("Error updating leave type:", error);
      toast.error("Failed to update leave type. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle adding new leave type
  const handleAddNewClick = (): void => {
    setIsAddingNew(true);
  };

  // Handle input changes for new leave type
  const handleNewLeaveTypeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setNewLeaveType({
      ...newLeaveType,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  // Handle saving new leave type
  const handleAddSave = async (): Promise<void> => {
    if (newLeaveType.leaveType.trim() === "") {
      toast.error("Leave type cannot be empty.");
      return;
    }

    const cmpId = localStorage.getItem("cmpnyId"); // Get company ID from localStorage
    const token = localStorage.getItem("token"); // Get token from localStorage

    if (!cmpId || !token) {
      toast.error("Missing company ID or token. Please log in again.");
      return;
    }

    setSavingNew(true);
    try {
      const response = await fetch(
        `http://64.227.152.179:8080/HRM-1/company_leave/add_leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            leaveType: newLeaveType.leaveType,
            amount: newLeaveType.amount,
            cmpId: cmpId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add leave type");
      }

      const data = await response.json();
      setLeaveTypes([...leaveTypes, data]);
      setNewLeaveType({ leaveType: "", amount: 0 });
      setIsAddingNew(false);
      toast.success("Leave type added successfully!");
    } catch (error) {
      console.error("Error adding leave type:", error);
      toast.error("Failed to add leave type. Please try again.");
    } finally {
      setSavingNew(false);
    }
  };

  // Handle canceling add or edit
  const handleCancel = (): void => {
    setEditingId(null);
    setIsAddingNew(false);
  };

  // Handle deleting a leave type
  const handleDelete = async (id: number): Promise<void> => {
    const cmpId = localStorage.getItem("cmpnyId"); // Get company ID from localStorage
    const token = localStorage.getItem("token"); // Get token from localStorage

    if (!cmpId || !token) {
      toast.error("Missing company ID or token. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `http://64.227.152.179:8080/HRM-1/company_leave/delete_leave/${cmpId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete leave type");
      }

      setLeaveTypes((prevLeaveTypes) =>
        prevLeaveTypes.filter((lt) => lt.id !== id)
      );
      toast.success("Leave type deleted successfully!");
    } catch (error) {
      console.error("Error deleting leave type:", error);
      toast.error("Failed to delete leave type. Please try again.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(leaveTypes.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentLeaveTypes = leaveTypes.slice(indexOfFirstItem, indexOfLastItem);

  // Function to generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const prevPage = currentPage - 1;
    const nextPage = currentPage + 1;

    // Always show the current page
    buttons.push(
      <button
        key={currentPage}
        onClick={() => setCurrentPage(currentPage)}
        className={`px-4 py-2 mx-1 text-sm ${
          currentPage === currentPage
            ? "bg-sky-500 text-white"
            : "bg-gray-200 text-gray-700"
        } rounded hover:bg-sky-600`}
      >
        {currentPage}
      </button>
    );

    // Show the previous page if it exists
    if (prevPage >= 1) {
      buttons.unshift(
        <button
          key={prevPage}
          onClick={() => setCurrentPage(prevPage)}
          className={`px-4 py-2 mx-1 text-sm ${
            currentPage === prevPage
              ? "bg-sky-500 text-white"
              : "bg-gray-200 text-gray-700"
          } rounded hover:bg-sky-600`}
        >
          {prevPage}
        </button>
      );
    }

    // Show the next page if it exists
    if (nextPage <= totalPages) {
      buttons.push(
        <button
          key={nextPage}
          onClick={() => setCurrentPage(nextPage)}
          className={`px-4 py-2 mx-1 text-sm ${
            currentPage === nextPage
              ? "bg-sky-500 text-white"
              : "bg-gray-200 text-gray-700"
          } rounded hover:bg-sky-600`}
        >
          {nextPage}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md transition hover:shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Leave Types</h3>
        <button
          onClick={handleAddNewClick}
          className="text-sky-500 hover:text-sky-800 flex items-center gap-1 text-sm"
          disabled={loading}
        >
          <FaPlus /> Add New Leave Type
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex justify-center">
          <Loading
            size="md"
            color="border-sky-500"
            text="Loading leave types..."
          />
        </div>
      ) : leaveTypes.length === 0 && !isAddingNew ? (
        <div className="mt-4 text-center text-gray-500">
          No data added yet. Click "Add New Leave Type" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {currentLeaveTypes.map((leaveType) => (
            <div
              key={leaveType.id}
              className="border border-gray-200 rounded-md p-4 hover:border-sky-300 transition"
            >
              {editingId === leaveType.id ? (
                // Edit mode
                <>
                  <div className="mb-2">
                    <label className="text-gray-500 text-sm flex items-center gap-1">
                      <FaCalendarAlt /> Leave Type
                    </label>
                    <input
                      type="text"
                      name="leaveType"
                      value={editFormData.leaveType}
                      onChange={handleEditChange}
                      className="w-full p-1.5 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="text-gray-500 text-sm flex items-center gap-1">
                      <FaCalendarAlt /> Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={editFormData.amount}
                      onChange={handleEditChange}
                      className="w-full p-1.5 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                      disabled={savingEdit}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveClick}
                      className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-1 disabled:bg-green-400 disabled:cursor-not-allowed"
                      disabled={savingEdit}
                    >
                      {savingEdit ? (
                        <>
                          <Loading
                            size="xs"
                            color="border-white"
                            className="inline mr-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave /> Save
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FaCalendarAlt /> Leave Type
                    </p>
                    <p className="text-gray-900 font-medium">
                      {leaveType.leaveType}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FaCalendarAlt /> Amount
                    </p>
                    <p className="text-gray-900 font-medium">
                      {leaveType.amount} days
                    </p>
                  </div>
                  <div className="mt-3 text-right">
                    <button
                      onClick={() => handleEditClick(leaveType)}
                      className="text-sky-500 hover:text-sky-800 flex items-center gap-1 text-sm mr-2"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(leaveType.id)}
                      className="text-red-500 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add new leave type form */}
          {isAddingNew && (
            <div className="border border-sky-300 rounded-md p-4 bg-blue-50">
              <div className="mb-2">
                <label className="text-gray-500 text-sm flex items-center gap-1">
                  <FaCalendarAlt /> Leave Type
                </label>
                <input
                  type="text"
                  name="leaveType"
                  value={newLeaveType.leaveType}
                  onChange={handleNewLeaveTypeChange}
                  className="w-full p-1.5 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter leave type"
                />
              </div>
              <div className="mb-2">
                <label className="text-gray-500 text-sm flex items-center gap-1">
                  <FaCalendarAlt /> Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newLeaveType.amount}
                  onChange={handleNewLeaveTypeChange}
                  className="w-full p-1.5 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter number of days"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                  disabled={savingNew}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSave}
                  className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-1 disabled:bg-green-400 disabled:cursor-not-allowed"
                  disabled={savingNew}
                >
                  {savingNew ? (
                    <>
                      <Loading
                        size="xs"
                        color="border-white"
                        className="inline mr-2"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && leaveTypes.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {renderPaginationButtons()}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default LeaveSettings;
