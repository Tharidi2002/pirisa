import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Check,
  Languages,
  LockKeyhole,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import PasswordReset from "../components/CompanyProfile/ResetPassword";
import { useTranslation } from "../context/LanguageProvider";
import { API_BASE } from "../api/endpoints";

type DisplayMode = "light" | "dark";

interface UserAccountProfile {
  name: string;
  email: string;
  username: string;
  role: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useTranslation();
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() =>
    localStorage.getItem("hrmDisplayMode") === "dark" ? "dark" : "light",
  );
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<UserAccountProfile | null>(
    null,
  );
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const canManageCompany = role === "CMPNY" || role === "HRM";
  const usesUserRecordProfile = role === "HRM" || role === "USER";
  const profilePath =
    role === "EMPLOYEE" ? "/self-service/profile" : "/companyProfile";
  const profileActionLabel =
    role === "CMPNY" ? "View company profile" : "View and update profile";

  const handleLogout = () => {
    [
      "token",
      "role",
      "username",
      "cmpnyId",
      "companyId",
      "empId",
      "userId",
    ].forEach((key) => localStorage.removeItem(key));
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    document.documentElement.dataset.displayMode = displayMode;
    localStorage.setItem("hrmDisplayMode", displayMode);
  }, [displayMode]);

  useEffect(() => {
    if (!usesUserRecordProfile) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await fetch(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || result.resultCode !== 100) {
          throw new Error(result.message || "Profile could not be loaded.");
        }
        const profile = result.data as UserAccountProfile;
        setUserProfile(profile);
        setProfileForm({
          name: profile.name || "",
          email: profile.email || "",
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setProfileError(
          error instanceof Error
            ? error.message
            : "Profile could not be loaded.",
        );
      } finally {
        setProfileLoading(false);
      }
    };

    void loadProfile();
    return () => controller.abort();
  }, [usesUserRecordProfile]);

  const handleUserProfileSave = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileError("Please sign in again to update your profile.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    setProfileSaved(false);
    try {
      const response = await fetch(`${API_BASE}/user/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });
      const result = await response.json();
      if (!response.ok || result.resultCode !== 100) {
        throw new Error(result.message || "Profile could not be updated.");
      }
      setUserProfile(result.data as UserAccountProfile);
      setProfileEditing(false);
      setProfileSaved(true);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Profile could not be updated.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          Account preferences
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your language, appearance and account security.
        </p>
      </header>

      <section
        id="preferences"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
            <Languages className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Personalize how PirisaHR appears to you.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label
                htmlFor="settings-language"
                className="text-sm font-semibold text-slate-800"
              >
                Language
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Choose the language used across the application.
              </p>
            </div>
            <select
              id="settings-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Display mode
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Select a light or dark workspace. Your choice is saved on this
                device.
              </p>
            </div>
            <div
              className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-1 sm:w-auto"
              role="group"
              aria-label="Display mode"
            >
              <button
                type="button"
                onClick={() => setDisplayMode("light")}
                aria-pressed={displayMode === "light"}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  displayMode === "light"
                    ? "bg-white text-blue-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sun className="h-4 w-4" aria-hidden="true" />
                Light
                {displayMode === "light" && (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("dark")}
                aria-pressed={displayMode === "dark"}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  displayMode === "dark"
                    ? "bg-white text-blue-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Moon className="h-4 w-4" aria-hidden="true" />
                Dark
                {displayMode === "dark" && (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="security"
        className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Security
              </h2>
              <p className="text-xs text-slate-500">
                Update the password for your account.
              </p>
            </div>
          </div>
          {!isChangingPassword && (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
            >
              Change password
            </button>
          )}
        </div>
        {isChangingPassword && (
          <div className="mt-4 border-t border-slate-100 pt-1">
            <PasswordReset onCancel={() => setIsChangingPassword(false)} />
          </div>
        )}
      </section>

      {usesUserRecordProfile ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Profile
                </h2>
                <p className="text-xs text-slate-500">
                  View and update your account details.
                </p>
              </div>
            </div>
            {!profileEditing && userProfile && (
              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    name: userProfile.name || "",
                    email: userProfile.email || "",
                  });
                  setProfileEditing(true);
                  setProfileSaved(false);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                Edit profile
              </button>
            )}
          </div>

          {profileError && (
            <p className="mt-4 text-sm text-rose-700" role="alert">
              {profileError}
            </p>
          )}
          {profileSaved && (
            <p className="mt-4 text-sm text-emerald-700" role="status">
              Profile updated.
            </p>
          )}
          {profileLoading ? (
            <p className="mt-5 text-sm text-slate-500">Loading profile...</p>
          ) : userProfile ? (
            profileEditing ? (
              <form
                onSubmit={handleUserProfileSave}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  Name
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        name: event.target.value,
                      })
                    }
                    autoComplete="name"
                    required
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      setProfileForm({
                        ...profileForm,
                        email: event.target.value,
                      })
                    }
                    autoComplete="email"
                    required
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                  <p className="text-xs text-slate-500">
                    Username: {userProfile.username}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileEditing(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {profileSaving ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500">Name</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {userProfile.name || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Email</dt>
                  <dd className="mt-1 break-all text-sm font-medium text-slate-800">
                    {userProfile.email || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Username</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {userProfile.username || "-"}
                  </dd>
                </div>
              </dl>
            )
          ) : null}
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Profile
                </h2>
                <p className="text-xs text-slate-500">
                  View or update your profile details.
                </p>
              </div>
            </div>
            <Link
              to={profilePath}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
            >
              {profileActionLabel}
            </Link>
          </div>
        </section>
      )}

      {canManageCompany && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <Building2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Organization
                </h2>
                <p className="text-xs text-slate-500">
                  Manage company details, logo and HR policies.
                </p>
              </div>
            </div>
            <Link
              to="/company-settings"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Company settings
            </Link>
          </div>
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Sign out</h2>
            <p className="text-xs text-slate-500">
              Sign out of this account on this device.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
        >
          Logout
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
