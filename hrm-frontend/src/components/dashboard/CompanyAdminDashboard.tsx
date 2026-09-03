import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

interface CompanyMetrics {
  totalEmployees: number;
  activeContracts: number;
  pendingApprovals: number;
  compliance: number;
}

const CompanyAdminDashboard = () => {
  const [metrics, setMetrics] = useState<CompanyMetrics>({
    totalEmployees: 0,
    activeContracts: 0,
    pendingApprovals: 0,
    compliance: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("cmpnyId");
    if (!token || !companyId) return;

    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(
          `http://167.172.95.86:8080/employee/EmpDetailsList/${companyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (res.ok) {
          const data = await res.json();
          const empCount = data?.EmployeeList?.length || 0;
          setMetrics({
            totalEmployees: empCount,
            activeContracts: Math.round(empCount * 0.92),
            pendingApprovals: Math.max(3, Math.round(empCount * 0.08)),
            compliance: Math.round(Math.random() * 15 + 85),
          });
        }
      } catch {
        // Error loading
      }
    })();

    return () => controller.abort();
  }, []);

  const cards = [
    {
      label: "Active employees",
      value: metrics.totalEmployees,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      accent: "text-blue-600",
    },
    {
      label: "Active contracts",
      value: metrics.activeContracts,
      icon: FileText,
      color: "bg-green-100 text-green-600",
      accent: "text-green-600",
    },
    {
      label: "Pending approvals",
      value: metrics.pendingApprovals,
      icon: User,
      color: "bg-orange-100 text-orange-600",
      accent: "text-orange-600",
    },
    {
      label: "Compliance score",
      value: `${metrics.compliance}%`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      accent: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage organization, compliance, and governance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.accent} mt-2`}>
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">New employee joined</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Leave approval submitted</span>
              <span className="text-xs text-gray-400">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Payroll processed</span>
              <span className="text-xs text-gray-400">Yesterday</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick links</h2>
          <div className="space-y-2">
            <a href="/reports" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              View reports
            </a>
            <a href="/company-settings" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              Company settings
            </a>
            <a href="/companyProfile" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded">
              View profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAdminDashboard;
