import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading/Loading";

interface CompanyRegistrationData {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<CompanyRegistrationData>({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/company/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cmp_name: formData.companyName,
          cmp_email: formData.email,
          cmp_phone: formData.phone,
          cmp_address: formData.address,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please login with your credentials.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Left Side: Welcome Banner */}
      <div
        className="hidden md:flex flex-1 items-center justify-center bg-cover bg-center bg-no-repeat h-screen w-full"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.9)), url(/loginBackground.jpg)`,
        }}
      >
        <div className="text-center px-5 pt-24">
          <h2 className="text-6xl font-bold mb-4 text-zinc-300">
            Join PirisaHR
          </h2>
          <p className="text-gray-400 text mb-2">
            Register your company for HR Management
          </p>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex flex-col flex-1 justify-center items-center px-8 md:px-0">
        <div className="w-full max-w-md">
          <div className="flex flex-col justify-center items-center mb-6">
            <img src="/logo.png" alt="PirisaHR Logo" className="h-20" />
            <p className="text-gray-400 text mb-2">HR Management Software</p>
          </div>

          <h1 className="text-2xl font-semibold text-gray-700 mb-4 items-center text-center">
            Company Registration
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-600"
              >
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter your company name"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 border-gray-300"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 border-gray-300"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-600"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 border-gray-300"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-600"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter your company address"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 border-gray-300"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 border-gray-300"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a password"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 pr-10 border-gray-300"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-600 hover:text-gray-800"
                style={{ top: '2.5rem' }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-600"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                className="w-full mt-1 p-3 border rounded-lg shadow-sm focus:ring focus:ring-green-200 pr-10 border-gray-300"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-600 hover:text-gray-800"
                style={{ top: '2.5rem' }}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md focus:ring focus:ring-green-300 relative disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loading
                    size="xs"
                    color="border-white"
                    className="inline mr-2"
                  />
                  <span>Registering...</span>
                </>
              ) : (
                "Register Company"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-green-500 hover:text-green-600 font-medium"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterPage;
