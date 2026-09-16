import React, { useEffect, useState } from "react";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase,
  FaBuilding, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaIdCard,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import {
  selfServiceApi,
  EmployeeProfile,
  ProfileUpdateRequest,
} from "../../api/services/selfServiceApi";

const SelfServiceProfile: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileUpdateRequest>({
    phone: "",
    address: "",
    email: "",
  });

  const employeeId = parseInt(localStorage.getItem("empId") || "0");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await selfServiceApi.getProfile(employeeId);
        setProfile(data);
        setForm({
          phone: data.phone || "",
          address: data.address || "",
          email: data.email || "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchProfile();
  }, [employeeId]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await selfServiceApi.updateProfile(employeeId, form);
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setForm({
      phone: profile.phone || "",
      address: profile.address || "",
      email: profile.email || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 text-center text-gray-500">Profile not found</div>;
  }

  const InfoCard = ({
    icon,
    label,
    value,
    editing = false,
    field,
    type = "text",
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    editing?: boolean;
    field?: keyof ProfileUpdateRequest;
    type?: string;
  }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        {icon} <span>{label}</span>
      </div>
      {editing && field ? (
        <input
          type={type}
          value={(form[field] as string) || ""}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      ) : (
        <div className="font-medium text-gray-800">{value || "-"}</div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-500 text-sm">{profile.designationName}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                  {profile.epfNo}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FaSave /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  <FaTimes /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaEdit className="text-sky-500" /> Contact Information
          {isEditing && (
            <span className="text-xs font-normal text-gray-500 ml-2">
              (You can edit these fields)
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon={<FaEnvelope />}
            label="Email"
            value={profile.email}
            editing={isEditing}
            field="email"
            type="email"
          />
          <InfoCard
            icon={<FaPhone />}
            label="Phone"
            value={profile.phone}
            editing={isEditing}
            field="phone"
          />
          <div className="md:col-span-2">
            <InfoCard
              icon={<FaMapMarkerAlt />}
              label="Address"
              value={profile.address}
              editing={isEditing}
              field="address"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBriefcase className="text-sky-500" /> Employment Details
          <span className="text-xs font-normal text-gray-500 ml-2">
            (Contact HR to update)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard icon={<FaIdCard />} label="Employee ID" value={profile.epfNo} />
          <InfoCard icon={<FaUser />} label="EMP Number" value={profile.empNo} />
          <InfoCard icon={<FaBuilding />} label="Department" value={profile.departmentName} />
          <InfoCard icon={<FaBriefcase />} label="Designation" value={profile.designationName} />
          <InfoCard icon={<FaCalendarAlt />} label="Date of Joining" value={profile.dateOfJoining} />
          <InfoCard icon={<FaUser />} label="Gender" value={profile.gender} />
          <InfoCard icon={<FaCalendarAlt />} label="Date of Birth" value={profile.dob} />
          <InfoCard icon={<FaIdCard />} label="NIC" value={profile.nic} />
        </div>
      </div>
    </div>
  );
};

export default SelfServiceProfile;