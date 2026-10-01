import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import backgroundImage from "../assets/images/loginBackground.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading/Loading";
import { API_BASE } from "../api/endpoints";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // Password visibility state
  const navigate = useNavigate();
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Check for SSO token on component mount
  useEffect(() => {
    const checkSSOToken = () => {
      const ssoTokenStr = localStorage.getItem("knoweb_sso_token");

      if (ssoTokenStr) {
        try {
          const ssoToken = JSON.parse(ssoTokenStr);

          // Verify token is recent (within 5 minutes)
          const tokenAge = Date.now() - ssoToken.timestamp;
          const fiveMinutes = 5 * 60 * 1000;

          if (tokenAge < fiveMinutes && ssoToken.source === "knoweb") {
            // Valid SSO token - set up session data for company user
            // Using dummy token since we're bypassing normal login
            localStorage.setItem("token", "sso_token_" + Date.now());
            localStorage.setItem("role", "CMPNY");
            localStorage.setItem("username", ssoToken.email);
            localStorage.setItem("companyName", ssoToken.companyName);

            // Remove SSO token after use
            localStorage.removeItem("knoweb_sso_token");

            toast.success(
              `Welcome ${ssoToken.companyName}! Logged in via KNOWEB`,
            );
            navigate("/dashboard");
            return;
          } else {
            // Token expired or invalid
            localStorage.removeItem("knoweb_sso_token");
          }
        } catch (error) {
          console.error("Error parsing SSO token:", error);
          localStorage.removeItem("knoweb_sso_token");
        }
      }
    };

    checkSSOToken();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.response.resultCode === 100) {
        console.log("DEBUG - Login successful, storing data:", data.details);

        // Store common user data
        localStorage.setItem("token", data.details.token);
        localStorage.setItem("role", data.details.Role);
        localStorage.setItem("username", data.details.username);

        // Role-specific ID storage
        if (data.details.Role === "CMPNY") {
          // For company users, store CMPNY_Id
          console.log("DEBUG - Storing CMPNY_Id:", data.details.CMPNY_Id);
          localStorage.setItem("cmpnyId", data.details.CMPNY_Id);
          localStorage.setItem("companyId", data.details.CMPNY_Id);
          // console.log("Company login:", {
          //   role: data.details.Role,
          //   companyId: data.details.CMPNY_Id,
          //   username: data.details.username,
          // });
          navigate("/dashboard");
        } else {
          // For employees, store EMP_id (assuming it's available in the response)
          // If the field is named differently, adjust accordingly
          console.log("DEBUG - Storing employee data:", data.details);
          localStorage.setItem(
            "empId",
            data.details.EMP_id || data.details.employeeId,
          );
          localStorage.setItem("cmpnyId", data.details.CMPNY_Id);
          localStorage.setItem("companyId", data.details.CMPNY_Id);

          // console.log("Employee login:", {
          //   role: data.details.Role,
          //   employeeId: data.details.EMP_id || data.details.employeeId,
          //   username: data.details.username,
          // });
          navigate("/employee-dashboard");
        }

        toast.success("Login successful!");
      } else {
        setError(
          data.response.resultMessage ||
            "Login failed. Please check your credentials.",
        );
        toast.error(
          data.response.resultMessage ||
            "Login failed. Please check your credentials.",
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("An error occurred. Please try again later.");
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address to reset your password.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsForgotLoading(true);

    try {
      const response = await fetch(
        `/api/password/forgotPassword?email=${encodeURIComponent(resetEmail)}`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (data.resultCode === 100) {
        // Show success message and close modal
        toast.success(
          data.message || "A new password has been sent to your email address.",
          {
            position: "top-center",
            autoClose: 8000,
            closeOnClick: false,
            pauseOnHover: true,
          },
        );
        setShowForgotModal(false);
        setResetEmail("");
      } else {
        // Show error message
        toast.error(
          data.message ||
            "Email not found. Please check your email and try again.",
          {
            position: "top-center",
            autoClose: 8000,
          },
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section
        className="auth-visual"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
        aria-label="PirisaHR welcome"
      >
        <div className="auth-visual-content">
          <p className="auth-kicker">PEOPLE OPERATIONS, MADE CLEAR</p>
          <h2>
            Welcome to <span>PirisaHR</span>
          </h2>
          <p>
            Bring your people, attendance and payroll together in one place.
          </p>
        </div>
      </section>

      <section className="auth-content auth-content--login">
        <div className="auth-form-wrap">
          <div className="auth-brand">
            <img src="/logo.png" alt="PirisaHR" className="auth-logo" />
            <p>HR Management Software</p>
          </div>

          <h1>Welcome back</h1>
          <p className="auth-intro">Sign in to continue to your workspace.</p>
          {error && (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Username or email <span>*</span>
              </label>
              <input
                type="text"
                id="email"
                name="email"
                autoComplete="username"
                placeholder="Enter your username or email"
                required
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="auth-helper">
                You can use either your username or email address.
              </p>
            </div>

            <div className="auth-field auth-password-field">
              <label htmlFor="password" className="auth-label">
                Password <span>*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                className="auth-input auth-input--password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
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
            </div>

            <div className="auth-form-options">
              <label className="auth-checkbox" htmlFor="remember-me">
                <input type="checkbox" id="remember-me" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="auth-text-button"
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loading
                    size="xs"
                    color="border-white"
                    className="inline mr-2"
                  />
                  <span>Logging in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="auth-account-link">
            <p>
              New to PirisaHR?{" "}
              <button
                onClick={() => navigate("/register")}
                className="auth-text-button"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Password Reset Modal */}
      {showForgotModal && (
        <div className="auth-modal-backdrop">
          <div className="auth-modal">
            <h2>Reset password</h2>
            <p>Enter your email address and we'll send you a new password.</p>

            <div className="auth-form">
              <div>
                <label htmlFor="reset-email" className="auth-label">
                  Email address <span>*</span>
                </label>
                <input
                  type="email"
                  id="reset-email"
                  name="reset-email"
                  placeholder="Enter your email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetEmail("");
                  }}
                  className="auth-secondary-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isForgotLoading}
                  className="auth-submit"
                >
                  {isForgotLoading ? (
                    <>
                      <Loading
                        size="xs"
                        color="border-white"
                        className="inline mr-2"
                      />
                      Sending...
                    </>
                  ) : (
                    "Send Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </main>
  );
};

export default LoginPage;
