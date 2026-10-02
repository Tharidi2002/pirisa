import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading/Loading";
import { ENDPOINTS } from "../api/endpoints";
import { axiosInstance } from "../api/config/axios";
import backgroundImage from "../assets/images/loginBackground.jpg";

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
  const [errors, setErrors] = useState<Partial<CompanyRegistrationData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanParam = searchParams.get("plan");

  const validateForm = (): boolean => {
    const newErrors: Partial<CompanyRegistrationData> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CompanyRegistrationData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const requestData = {
        cmpName: formData.companyName,
        cmpEmail: formData.email,
        cmpPhone: formData.phone,
        cmpAddress: formData.address,
        username: formData.username,
        password: formData.password,
      };

      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.REGISTER,
        requestData,
      );

      toast.success(
        "Registration successful! Please login with your credentials.",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return response;
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage =
        (axios.isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message
          : undefined) ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="auth-page">
        <section
          className="auth-visual"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-label="Join PirisaHR"
        >
          <div className="auth-visual-content">
            <p className="auth-kicker">A BETTER WAY TO WORK</p>
            <h2>
              Build a stronger <span>workplace.</span>
            </h2>
            <p>
              Set up your organization and give your team a better HR
              experience.
            </p>
          </div>
        </section>

        <section className="auth-content auth-content--register">
          <div className="auth-form-wrap auth-form-wrap--register">
            <div className="auth-brand">
              <img src="/logo.png" alt="PirisaHR" className="auth-logo" />
              <p>HR Management Software</p>
            </div>

            <h1>Create your company account</h1>
            <p className="auth-intro">
              Add your organization details to get started.
            </p>

            {selectedPlanParam && (
              <div className="auth-plan-chip">
                Selected plan <strong>{selectedPlanParam}</strong>
              </div>
            )}

            <form
              className="auth-form auth-register-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="companyName" className="auth-label">
                  Company name <span>*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  autoComplete="organization"
                  placeholder="Enter your company name"
                  required
                  className={`auth-input ${errors.companyName ? "auth-input--error" : ""}`}
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
                {errors.companyName && (
                  <p className="auth-field-error">{errors.companyName}</p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="email" className="auth-label">
                  Work email <span>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  required
                  className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <p className="auth-field-error">{errors.email}</p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="phone" className="auth-label">
                  Phone number <span>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  required
                  className={`auth-input ${errors.phone ? "auth-input--error" : ""}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && (
                  <p className="auth-field-error">{errors.phone}</p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="address" className="auth-label">
                  Company address <span>*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  placeholder="Enter your company address"
                  required
                  className={`auth-input ${errors.address ? "auth-input--error" : ""}`}
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {errors.address && (
                  <p className="auth-field-error">{errors.address}</p>
                )}
              </div>

              <div className="auth-field auth-field--wide">
                <label htmlFor="username" className="auth-label">
                  Admin username <span>*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="Choose a username"
                  required
                  className={`auth-input ${errors.username ? "auth-input--error" : ""}`}
                  value={formData.username}
                  onChange={handleInputChange}
                />
                {errors.username && (
                  <p className="auth-field-error">{errors.username}</p>
                )}
              </div>

              <div className="auth-field auth-password-field">
                <label htmlFor="password" className="auth-label">
                  Password <span>*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  required
                  className={`auth-input auth-input--password ${errors.password ? "auth-input--error" : ""}`}
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {errors.password && (
                  <p className="auth-field-error">{errors.password}</p>
                )}
              </div>

              <div className="auth-field auth-password-field">
                <label htmlFor="confirmPassword" className="auth-label">
                  Confirm password <span>*</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  required
                  className={`auth-input auth-input--password ${errors.confirmPassword ? "auth-input--error" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-password-toggle"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="auth-field-error">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit auth-field--wide"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loading
                      size="xs"
                      color="border-white"
                      className="inline mr-2"
                    />
                    <span>Creating account...</span>
                  </>
                ) : (
                  "Create company account"
                )}
              </button>
            </form>

            <div className="auth-account-link">
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="auth-text-button"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
      <ToastContainer />
    </>
  );
};

export default RegisterPage;
