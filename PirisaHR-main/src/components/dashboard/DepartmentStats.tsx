import { PieChart, Pie, Cell } from 'recharts';

interface DepartmentData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const DepartmentStats = () => {
  const data: DepartmentData[] = [
    { name: 'Software', value: 65, percentage: 70, color: '#f471b5' },
    { name: 'Accounting', value: 58, percentage: 30, color: '#4ade80' },
    { name: 'Admin', value: 12, percentage: 35, color: '#facc15' },
    { name: 'IT', value: 45, percentage: 30, color: '#f43f5e' },
    { name: 'Labour', value: 90, percentage: 30, color: '#60a5fa' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Department</h2>
      
      <div className="relative flex justify-center mb-8">
        <div className="relative w-48 h-48">
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              cx={96}
              cy={96}
              innerRadius={60}
              outerRadius={96}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold">{total}</span>
            <span className="text-gray-500 text-sm">Total</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((dept, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: dept.color }}
              />
              <span className="text-gray-600">{dept.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium">{dept.value}</span>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${dept.color}15`,
                  color: dept.color 
                }}
              >
                {dept.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentStats;
