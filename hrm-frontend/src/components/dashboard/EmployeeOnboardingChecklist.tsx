import { useEffect, useState } from "react";
import { CheckCircle, Clock, LogIn, Award, Shield, FileCheck } from "lucide-react";

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: typeof LogIn | typeof CheckCircle | typeof FileCheck | typeof Shield | typeof Award;
  dueDate?: string;
}

const EmployeeOnboardingChecklist = () => {
  const [items, setItems] = useState<OnboardingItem[]>([
    {
      id: "profile",
      title: "Complete profile",
      description: "Update your personal and contact information",
      completed: false,
      icon: LogIn,
    },
    {
      id: "documents",
      title: "Submit documents",
      description: "Upload required certificates and identification",
      completed: false,
      icon: FileCheck,
    },
    {
      id: "banking",
      title: "Banking details",
      description: "Provide account info for salary disbursement",
      completed: false,
      icon: Shield,
    },
    {
      id: "training",
      title: "Complete training",
      description: "Finish orientation and system training modules",
      completed: false,
      icon: Award,
    },
  ]);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  useEffect(() => {
    // In production, fetch actual onboarding status from backend
    // For now, simulate some progress
    const timer = setTimeout(() => {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx < 2 ? { ...item, completed: true } : item
        )
      );
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Onboarding checklist</h2>
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{items.length} completed
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                item.completed
                  ? "border-green-100 bg-green-50"
                  : "border-gray-100 bg-gray-50 hover:bg-gray-100"
              } transition-colors`}
            >
              <div className="mt-1">
                {item.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Clock className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.completed ? "Done" : "Pending"}
                </span>
              </div>
            </div>
          ))}
      </div>

      {progressPercent === 100 && (
        <div className="mt-6 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">
            ✓ Onboarding complete! Welcome to the team.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeOnboardingChecklist;
