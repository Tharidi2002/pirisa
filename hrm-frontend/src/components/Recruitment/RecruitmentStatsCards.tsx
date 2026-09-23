import React, { useEffect, useState } from "react";
import {
  Briefcase,
  Users,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";
import { recruitmentStatsService } from "../../api/services/recruitmentService";
import { RecruitmentStats } from "../../api/types/recruitment.types";
import Loading from "../Loading/Loading";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <span className={`p-2.5 rounded-lg ${bgColor} ${color}`}>{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
  </div>
);

const RecruitmentStatsCards: React.FC = () => {
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = parseInt(localStorage.getItem("cmpnyId") || "0");

  useEffect(() => {
    const fetchStats = async () => {
      if (!companyId) {
        setError("Company ID not found");
        setLoading(false);
        return;
      }
      try {
        const data = await recruitmentStatsService.getStats(companyId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loading size="lg" text="Loading recruitment stats..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        {error || "No stats available"}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: <Briefcase size={20} />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Open Jobs",
      value: stats.openJobs,
      icon: <TrendingUp size={20} />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Total Applicants",
      value: stats.totalApplicants,
      icon: <Users size={20} />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "New Applicants",
      value: stats.newApplicants,
      icon: <FileText size={20} />,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
    },
    {
      title: "In Interview",
      value: stats.interviewApplicants,
      icon: <Calendar size={20} />,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Hired",
      value: stats.hiredApplicants,
      icon: <UserCheck size={20} />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rejected",
      value: stats.rejectedApplicants,
      icon: <UserX size={20} />,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Upcoming Interviews",
      value: stats.upcomingInterviews,
      icon: <Clock size={20} />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default RecruitmentStatsCards;