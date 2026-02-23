import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface EmployeeData {
  month: string;
  male: number;
  female: number;
}

const data: EmployeeData[] = [
  { month: 'Jan', male: 1200, female: 1100 },
  { month: 'Feb', male: 1300, female: 600 },
  { month: 'Mar', male: 950, female: 1300 },
  { month: 'Apr', male: 750, female: 950 },
  { month: 'May', male: 1100, female: 1200 },
  { month: 'Jun', male: 400, female: 850 },
  { month: 'Jul', male: 1200, female: 1100 },
  { month: 'Aug', male: 1300, female: 600 },
  { month: 'Sep', male: 950, female: 1300 },
  { month: 'Oct', male: 750, female: 950 },
  { month: 'Nov', male: 1100, female: 1200 },
  { month: 'Dec', male: 400, female: 850 }
];

const EmployeeGrowthChart = () => {
  return (
    <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Employees Growth</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <YAxis
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
              domain={[0, 2000]}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Bar
              dataKey="male"
              name="Male"
              fill="#93C5FD"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="female"
              name="Female"
              fill="#4ADE80"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmployeeGrowthChart;
