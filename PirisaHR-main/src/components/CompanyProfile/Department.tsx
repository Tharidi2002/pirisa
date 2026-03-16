/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { getApiBaseUrl, getBaseUrl } from "../../utils/apiConfig";

interface Department {
  id: number;
  dpt_name: string;
  dpt_code: string;
  dpt_desc: string;
  cmpId: number;
  designationList: Designation[];
}

interface Designation {
  id: number;
  designation: string;
  dptId: number;
}

interface ApiResponse {
  DepartmentList: Department[];
  resultCode: number;
  resultDesc: string;
}

const Department = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] =
    useState<Partial<Department> | null>(null);
  const [currentDesignation, setCurrentDesignation] = useState<{
    designation: string;
    dptId: number;
  }>({
    designation: "",
    dptId: 1,
  });
  // const [expandedDepartment, setExpandedDepartment] = useState<number | null>(
  //   null
  // );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  // Get company ID from localStorage
  const getCompanyId = (): number => {
    const cmpnyId = localStorage.getItem("cmpnyId");
    return cmpnyId ? parseInt(cmpnyId) : 1; // Default to 1 if not found
  };

  // Get token from localStorage
  const getToken = (): string => {
    return localStorage.getItem("token") || "";
  };

  // Fetch departments and designations
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const cmpId = getCompanyId();
      const response = await axios.get<ApiResponse>(
        `${getBaseUrl()}/department/company/${cmpId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      //console.log("API Response:", response.data);

      if (
        response.data.resultCode === 100 &&
        Array.isArray(response.data.DepartmentList)
      ) {
        setDepartments(response.data.DepartmentList);
        setFilteredDepartments(response.data.DepartmentList);
      } else if (response.data.resultCode === 102) {
        setError(response.data.resultDesc || "Department code or name already exists");
      } else {
        setError(response.data.resultDesc || "Failed to fetch departments");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Treat 404 as "no departments" rather than an error
        setDepartments([]);
      } else {
        setError("Error fetching departments. Please try again later.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new department
  const addDepartment = async (departmentData: Partial<Department>) => {
    try {
      const cmpId = getCompanyId();
      const payload = {
        dpt_name: departmentData.dpt_name,
        dpt_code: departmentData.dpt_code,
        cmpId: cmpId,
        dpt_desc: departmentData.dpt_desc || "",
      };

      const response = await axios.post(
        "${getBaseUrl()}/department/add_department",
        payload,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchDepartments(); // Refresh the list
        return true;
      } else if (response.status === 400) {
        const errorData = response.data;
        setError(errorData.resultDesc || "Failed to add department");
        return false;
      }
      return false;
    } catch (err) {
      console.error("Error adding department:", err);
      setError("Failed to add department. Please try again.");
      return false;
    }
  };

  // Update existing department
  const updateDepartment = async (departmentData: Partial<Department>) => {
    try {
      if (!departmentData.id) return false;

      const payload = {
        id: departmentData.id,
        dpt_name: departmentData.dpt_name,
        dpt_code: departmentData.dpt_code,
        cmpId: getCompanyId(),
        dpt_desc: departmentData.dpt_desc || "",
      };

      const response = await axios.put(
        "${getBaseUrl()}/department/update_department",
        payload,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchDepartments(); // Refresh the list
        return true;
      } else if (response.status === 400) {
        const errorData = response.data;
        setError(errorData.resultDesc || "Failed to update department");
        return false;
      }
      return false;
    } catch (err) {
      console.error("Error updating department:", err);
      setError("Failed to update department. Please try again.");
      return false;
    }
  };

  // Delete department
  const deleteDepartment = async (id: number) => {
    try {
      const response = await axios.delete(
        `${getBaseUrl()}/department/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchDepartments(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting department:", err);
      setError("Failed to delete department. Please try again.");
      return false;
    }
  };

  // Add new designation
  const addDesignation = async (designationData: {
    designation: string;
    dptId: number;
  }) => {
    try {
      const response = await axios.post(
        "${getBaseUrl()}/designation/add_designation",
        designationData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchDepartments(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding designation:", err);
      setError("Failed to add designation. Please try again.");
      return false;
    }
  };

  // Delete designation
  const deleteDesignation = async (id: number) => {
    try {
      const response = await axios.delete(
        `${getBaseUrl()}/designation/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 200) {
        await fetchDepartments(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting designation:", err);
      setError("Failed to delete designation. Please try again.");
      return false;
    }
  };

  // Load departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Department Modal Functions
  const handleOpenDepartmentModal = (dept: Department | null = null) => {
    if (dept) {
      setCurrentDepartment({
        id: dept.id,
        dpt_name: dept.dpt_name,
        dpt_code: dept.dpt_code,
        dpt_desc: dept.dpt_desc,
      });
    } else {
      setCurrentDepartment({ dpt_name: "", dpt_code: "", dpt_desc: "" });
    }
    setShowDepartmentModal(true);
  };

  const handleCloseDepartmentModal = () => {
    setCurrentDepartment(null);
    setShowDepartmentModal(false);
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDepartment?.dpt_name?.trim() || !currentDepartment?.dpt_code?.trim()) {
      setError("Department name and code are required");
      return;
    }

    // Check if trying to update department code or name for existing department
    if (currentDepartment.id) {
      const originalDept = departments.find(d => d.id === currentDepartment.id);
      if (originalDept) {
        if (originalDept.dpt_code !== currentDepartment.dpt_code || 
            originalDept.dpt_name !== currentDepartment.dpt_name) {
          setError("Department code and name cannot be updated as they are professional identifiers");
          return;
        }
      }
    }

    // Client-side validation for duplicates (only for new departments)
    if (!currentDepartment.id) {
      const isDuplicate = departments.some(dept => 
        dept.dpt_code?.toLowerCase() === currentDepartment.dpt_code?.toLowerCase() ||
        dept.dpt_name?.toLowerCase() === currentDepartment.dpt_name?.toLowerCase()
      );

      if (isDuplicate) {
        setError("Department code or name already exists");
        return;
      }
    }

    let success = false;
    if (currentDepartment.id) {
      success = await updateDepartment(currentDepartment);
    } else {
      success = await addDepartment(currentDepartment);
    }

    if (success) {
      handleCloseDepartmentModal();
      setError("");
    }
  };

  // Designation Modal Functions
  const handleOpenDesignationModal = (departmentId: number) => {
    setCurrentDesignation({ designation: "", dptId: departmentId });
    setShowDesignationModal(true);
  };

  const handleCloseDesignationModal = () => {
    setShowDesignationModal(false);
  };

  const handleDesignationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDesignation.designation) return;

    const success = await addDesignation(currentDesignation);
    if (success) {
      handleCloseDesignationModal();
    }
  };

  // const toggleDepartmentExpand = (id: number) => {
  //   setExpandedDepartment(expandedDepartment === id ? null : id);
  // };

  const handleDeleteDepartment = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this department? All associated designations will also be deleted."
      )
    ) {
      const success = await deleteDepartment(id);
      if (!success) {
        setError("Failed to delete department. Please try again.");
      } else {
        setError(""); // Clear any existing errors
      }
    }
  };

  const handleDeleteDesignation = async (id: number) => {
    if (confirm("Are you sure you want to delete this designation?")) {
      const success = await deleteDesignation(id);
      if (!success) {
        setError("Failed to delete designation. Please try again.");
      } else {
        setError(""); // Clear any existing errors
      }
    }
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredDepartments(departments);
      return;
    }

    try {
      const cmpId = getCompanyId();
      const response = await axios.get<ApiResponse>(
        `${getBaseUrl()}/department/search/${cmpId}?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.data.resultCode === 100 && Array.isArray(response.data.DepartmentList)) {
        setFilteredDepartments(response.data.DepartmentList);
      }
    } catch {
      // If API fails, do client-side filtering
      const filtered = departments.filter(dept =>
        dept.dpt_name.toLowerCase().includes(query.toLowerCase()) ||
        dept.dpt_code.toLowerCase().includes(query.toLowerCase()) ||
        (dept.dpt_desc && dept.dpt_desc.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  };

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
            fetchDepartments();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Department & Designation Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your company departments and job designations</p>
            </div>
            <button
              onClick={() => handleOpenDepartmentModal()}
              className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Add Department</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700 break-words">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError("")}
                  className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search departments by name, code, or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-9 sm:pl-10 pr-8 sm:pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Found {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

      {/* Department List */}
      {filteredDepartments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
          <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
            {searchQuery ? "No departments found matching your search" : "No departments found"}
          </h3>
          <p className="mt-2 text-sm text-gray-500 px-4">
            {searchQuery ? "Try a different search term or clear the search" : "Get started by creating your first department."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => handleOpenDepartmentModal()}
              className="mt-4 sm:mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircleIcon className="w-4 h-4 mr-2" />
              Add Department
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Department Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {dept.dpt_name}
                    </h3>
                    <div className="flex flex-wrap items-center mt-1 gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dept.dpt_code}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {dept.designationList?.length || 0} designation{(dept.designationList?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDepartmentModal(dept);
                      }}
                      className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDepartment(dept.id);
                      }}
                      className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Department"
                    >
                      <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Description */}
              {dept.dpt_desc && (
                <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{dept.dpt_desc}</p>
                </div>
              )}

              {/* Designations Section */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Designations</h4>
                  <button
                    onClick={() => handleOpenDesignationModal(dept.id)}
                    className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircleIcon className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>

                {dept.designationList && dept.designationList.length > 0 ? (
                  <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {dept.designationList.map((desig) => (
                      <div
                        key={desig.id}
                        className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                          {desig.designation}
                        </span>
                        <button
                          onClick={() => handleDeleteDesignation(desig.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                          title="Delete Designation"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 sm:py-4">
                    <svg className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">No designations yet</p>
                    <button
                      onClick={() => handleOpenDesignationModal(dept.id)}
                      className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Add first designation
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {currentDepartment?.id ? "Edit Department" : "Add New Department"}
              </h2>
            </div>
            
            <form onSubmit={handleDepartmentSubmit} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name <span className="text-red-500">*</span>
                    {currentDepartment?.id && (
                      <span className="ml-2 text-xs text-gray-500 font-normal block sm:inline">
                        (Cannot be edited - professional identifier)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border ${currentDepartment?.id ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
                    value={currentDepartment?.dpt_name || ""}
                    onChange={(e) =>
                      !currentDepartment?.id && setCurrentDepartment((prev) => ({
                        ...prev!,
                        dpt_name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Human Resources"
                    required
                    readOnly={!!currentDepartment?.id}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Code <span className="text-red-500">*</span>
                    {currentDepartment?.id && (
                      <span className="ml-2 text-xs text-gray-500 font-normal block sm:inline">
                        (Cannot be edited - professional identifier)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border ${currentDepartment?.id ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
                    value={currentDepartment?.dpt_code || ""}
                    onChange={(e) =>
                      !currentDepartment?.id && setCurrentDepartment((prev) => ({
                        ...prev!,
                        dpt_code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., HR"
                    required
                    readOnly={!!currentDepartment?.id}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows={3}
                    value={currentDepartment?.dpt_desc || ""}
                    onChange={(e) =>
                      setCurrentDepartment((prev) => ({
                        ...prev!,
                        dpt_desc: e.target.value,
                      }))
                    }
                    placeholder="Brief description of the department's responsibilities..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseDepartmentModal}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
                >
                  {currentDepartment?.id ? "Update Department" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesignationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Add New Designation</h2>
            </div>
            
            <form onSubmit={handleDesignationSubmit} className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    value={currentDesignation.dptId}
                    onChange={(e) =>
                      setCurrentDesignation((prev) => ({
                        ...prev,
                        dptId: Number(e.target.value),
                      }))
                    }
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.dpt_name} ({dept.dpt_code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    value={currentDesignation.designation}
                    onChange={(e) =>
                      setCurrentDesignation((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    placeholder="e.g., Senior Developer"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseDesignationModal}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
                >
                  Create Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Department;
