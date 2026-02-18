// components/LeaveBalanceCard.tsx
interface LeaveBalanceCardProps {
  title: string;
  available: number;
  taken: number;
}

export const LeaveBalanceCard = ({ title, available, taken }: LeaveBalanceCardProps) => (
  <div className="border rounded-lg p-4 border-gray-300">
    <h4 className="font-medium text-gray-700 mb-2">{title}</h4>
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">Available</span>
      <span className="font-medium">{available} days</span>
    </div>
    <div className="flex justify-between text-sm mt-1">
      <span className="text-gray-500">Taken</span>
      <span className="font-medium">{taken} days</span>
    </div>
    <div className="flex justify-between text-sm mt-1">
      <span className="text-gray-500">Remaining</span>
      <span className="font-medium text-green-500">{available - taken} days</span>
    </div>
  </div>
);