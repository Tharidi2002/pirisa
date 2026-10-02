import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  CalendarCheck2,
  Clock3,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { API_BASE } from "../../api/endpoints";

interface DepartmentHeadcount {
  department: string;
  count: number;
}

interface DashboardActivity {
  id: string;
  type: "employee" | "attendance";
  title: string;
  description: string;
  occurredAt: string;
  hasTime: boolean;
}

interface CompanyDashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  newHiresThisMonth: number;
  departmentHeadcount: DepartmentHeadcount[];
  recentActivity: DashboardActivity[];
}

const formatActivityDate = (value: string, hasTime: boolean) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (hasTime) {
    options.hour = "numeric";
    options.minute = "2-digit";
  }
  return new Intl.DateTimeFormat(undefined, options).format(parsed);
};

const CompanyAdminDashboard = () => {
  const [summary, setSummary] = useState<CompanyDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("cmpnyId");
    if (!token || !companyId) {
      setError("Company dashboard data is unavailable. Please sign in again.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const loadDashboard = async (initialLoad = false) => {
      if (initialLoad) setLoading(true);
      else setRefreshing(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/company/dashboard/${companyId}/summary`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "You do not have access to this company dashboard."
              : "Company summary could not be loaded.",
          );
        }

        const data = (await response.json()) as CompanyDashboardSummary;
        if (
          !Array.isArray(data.departmentHeadcount) ||
          !Array.isArray(data.recentActivity)
        ) {
          throw new Error(
            "The dashboard received an invalid summary response.",
          );
        }

        setSummary(data);
        setLastUpdatedAt(new Date());
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError")
          return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Dashboard data could not be loaded.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    void loadDashboard(true);
    const intervalId = window.setInterval(() => void loadDashboard(), 60_000);
    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") void loadDashboard();
    };
    window.addEventListener("focus", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, [refreshKey]);

  const cards = [
    {
      label: "Total employees",
      value: summary?.totalEmployees,
      icon: Users,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active employees",
      value: summary?.activeEmployees,
      icon: UserPlus,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Present today",
      value: summary?.presentToday,
      icon: CalendarCheck2,
      tone: "bg-cyan-50 text-blue-700",
    },
    {
      label: "Pending leave",
      value: summary?.pendingLeaves,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Joined this month",
      value: summary?.newHiresThisMonth,
      icon: UserPlus,
      tone: "bg-sky-50 text-blue-700",
    },
  ];

  const quickLinks = [
    { label: "Employee directory", path: "/employee/all" },
    { label: "Attendance records", path: "/attendance/list" },
    { label: "Leave requests", path: "/leave/requests" },
    { label: "Payroll", path: "/payrole/salaryList" },
  ];

  return (
    <section id="company-summary" className="w-full space-y-5 scroll-mt-36">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            Workforce overview
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Company overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A current view of your people, attendance and leave activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500" aria-live="polite">
            {refreshing
              ? "Refreshing..."
              : lastUpdatedAt
                ? `Updated ${lastUpdatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : "Live data"}
          </span>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
            aria-label="Refresh dashboard data"
            title="Refresh dashboard data"
            disabled={refreshing || loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </header>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
          role="alert"
        >
          <span>{error}</span>
          {summary && (
            <span className="text-xs text-rose-700">
              Showing last loaded data.
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article
            key={label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-slate-600">{label}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                {loading && value === undefined ? "..." : (value ?? "--")}
              </p>
            </div>
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </article>
        ))}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <section
          id="department-summary"
          className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-5 scroll-mt-36"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Active staff by department
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Current employee distribution.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          {summary?.departmentHeadcount.length ? (
            <div className="h-[260px] px-3 py-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.departmentHeadcount}
                  layout="vertical"
                  margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
                >
                  <CartesianGrid stroke="#e8edf5" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={112}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#65708a", fontSize: 11 }}
                  />
                  <Tooltip cursor={{ fill: "#f4f7fb" }} />
                  <Bar
                    dataKey="count"
                    name="Employees"
                    fill="#4274d9"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[260px] items-center justify-center px-5 text-center text-sm text-slate-500">
              Department distribution will appear when employees are assigned to
              departments.
            </div>
          )}
        </section>

        <section
          id="recent-activity"
          className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-4 scroll-mt-36"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Employee starts and attendance records from the last 30 days.
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>

          {loading && !lastUpdatedAt ? (
            <div
              className="space-y-4 px-5 py-5"
              aria-label="Loading recent activity"
            >
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ) : summary?.recentActivity.length ? (
            <ul className="divide-y divide-slate-100">
              {summary.recentActivity.map((item) => {
                const Icon =
                  item.type === "employee" ? UserPlus : CalendarCheck2;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {item.description}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-slate-500"
                      dateTime={item.occurredAt}
                    >
                      {formatActivityDate(item.occurredAt, item.hasTime)}
                    </time>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex items-start gap-3 px-5 py-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  No recent activity yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  New employee starts and attendance records will appear here.
                </p>
              </div>
            </div>
          )}
        </section>

        <nav
          className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-3"
          aria-label="Dashboard quick links"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Quick links
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Go directly to a common task.
            </p>
          </div>
          <ul className="divide-y divide-slate-100 px-2 py-1">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-800"
                >
                  {link.label}
                  <ArrowUpRight
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
};

export default CompanyAdminDashboard;
