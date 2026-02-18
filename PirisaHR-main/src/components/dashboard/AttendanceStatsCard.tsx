import React from "react";
import StatisticItem from "../StatisticItem";

const AttendanceStatsCard: React.FC = () => {
  const stats = [
    { label: "Present", value: 100, percentage: "80.24%" },
    { label: "Absent", value: 20, percentage: "80.24%" },
    { label: "Leave", value: 5, percentage: "80.24%" },
    { label: "Pending", value: 30, percentage: "80.24%" },
    { label: "Offday", value: 2, percentage: "80.24%" },
    { label: "Late", value: 8, percentage: "80.24%" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-500 mb-4">Today</h2>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 ">
        {stats.map((stat, index) => (
          <StatisticItem
            key={index}
            label={stat.label}
            value={stat.value}
            percentage={stat.percentage}
          />
        ))}
      </div>
    </div>
  );
};

export default AttendanceStatsCard;