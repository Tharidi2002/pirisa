import React from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Users, Calendar, ArrowRight, Plus } from "lucide-react";
import RecruitmentStatsCards from "../../components/Recruitment/RecruitmentStatsCards";

const RecruitmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Job Postings",
      description: "Manage open positions and job listings",
      icon: <Briefcase className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      path: "/recruitment/jobs",
    },
    {
      title: "Applicants",
      description: "View and manage candidate applications",
      icon: <Users className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      path: "/recruitment/applicants",
    },
    {
      title: "Interviews",
      description: "Schedule and track interviews",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      path: "/recruitment/interviews",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Recruitment Dashboard</h1>
            <p className="text-sky-100 mt-1 text-sm">
              Track jobs, applicants, and interviews all in one place
            </p>
          </div>
          <button
            onClick={() => navigate("/recruitment/jobs?action=new")}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur hover:bg-white/30 px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Post New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Overview
        </h2>
        <RecruitmentStatsCards />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className={`group flex flex-col items-start gap-3 p-5 rounded-xl border-2 ${action.color} hover:shadow-md transition-all text-left`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-lg bg-white ${action.color.split(" ")[1]}`}>
                  {action.icon}
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{action.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentDashboardPage;