import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaEnvelope,
  FaBars,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { TranslatableText } from "../languages/TranslatableText";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LanguageProvider ";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarVisible: boolean;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    flag: "https://uxwing.com/wp-content/themes/uxwing/download/flags-landmarks/uk-flag-round-circle-icon.png",
  },
  {
    code: "si",
    name: "සිංහල",
    flag: "https://uxwing.com/wp-content/themes/uxwing/download/flags-landmarks/sri-lanka-flag-round-circle-icon.png",
  },
  {
    code: "ta",
    name: "தமிழ்",
    flag: "https://uxwing.com/wp-content/themes/uxwing/download/flags-landmarks/india-flag-round-circle-icon.png",
  },
];

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarVisible }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { language, setLanguage } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const currentLanguage =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) ||
    LANGUAGE_OPTIONS[0];

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/companyProfile");
    setIsProfileDropdownOpen(false); // Close dropdown after click
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("cmpnyId");
    localStorage.removeItem("empId");
    localStorage.removeItem("username");
    navigate("/login");
    setIsProfileDropdownOpen(false); // Close dropdown after click
    //console.log("User logged out");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target as Node)
    ) {
      setIsProfileDropdownOpen(false);
    }
  };

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      const token = localStorage.getItem("token");
      const cmpId = localStorage.getItem("cmpnyId");
      const empId = localStorage.getItem("empId");

      if (!token) {
        console.error("Token not found in localStorage");
        return;
      }

      try {
        // If employee, try to fetch employee photo first
        if (role === "EMPLOYEE" && empId) {
          try {
            const response = await fetch(
              `http://localhost:8080/document/view/emp/${empId}/photo`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const blob = await response.blob();
              if (blob.size > 0) {
                const imageUrl = URL.createObjectURL(blob);
                setLogoUrl(imageUrl);
                return;
              }
            }
          } catch (error) {
            console.error("Error fetching employee photo:", error);
          }
        }

        if (cmpId) {
          const logoResponse = await fetch(
            `http://localhost:8080/logo/view/${cmpId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (logoResponse.ok) {
            const blob = await logoResponse.blob();
            if (blob.size > 0) {
              // Check if logo exists
              const imageUrl = URL.createObjectURL(blob);
              setLogoUrl(imageUrl);
              return;
            }
          }
        }

        // If no logo found, use default icon based on role
        setLogoUrl(null);
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogoUrl(null);
      }
    };

    fetchLogo();
  }, [role]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`bg-white shadow px-6 py-4 flex justify-between items-center fixed top-0 ${
        isSidebarVisible ? "left-72" : "left-0"
      } right-0 transition-all duration-300 z-50`}
    >
      {/* Sidebar Toggle and Search */}
      <div className="flex items-center w-1/3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 mr-4 focus:outline-none cursor-pointer"
        >
          <FaBars className="text-xl" />
        </button>
        <input
          type="text"
          placeholder={language === "en" ? "Search" : "Search"}
          className="bg-gray-100 w-full px-4 py-2 rounded border focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        {/* Language Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer"
          >
            <img
              src={currentLanguage.flag}
              alt={currentLanguage.name}
              className="w-4 h-4 rounded-full"
            />
            <span className="text-sm">{currentLanguage.name}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  onClick={() => handleLanguageSelect(option.code)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <img
                    src={option.flag}
                    alt={option.name}
                    className="w-4 h-4 rounded-full"
                  />
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <FaEnvelope className="text-xl text-gray-600 cursor-pointer" />
        <FaBell className="text-xl text-gray-600 cursor-pointer" />

        {/* User Profile */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img
              src={logoUrl || "https://via.placeholder.com/150"}
              alt="User"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
            <div className="flex flex-col cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                <TranslatableText
                  text={localStorage.getItem("username") || "Guest"}
                />
              </span>
              <span className="text-sm text-gray-500">
                {localStorage.getItem("role") || "Role"}
              </span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${
                isProfileDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-sky-600 transition-colors duration-200"
                >
                  <FaUser className="mr-3 text-gray-400 group-hover:text-sky-600" />
                  <span>Profile</span>
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-sky-600 transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-3 text-gray-400 group-hover:text-sky-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
