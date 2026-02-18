import  { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { SlidersHorizontal } from 'lucide-react';

// interface AttendanceData {
//   date: string;
//   value: number;
//   highlight?: boolean;
// }

// Sample data for different time ranges
const timeRangeData = {
  Daily: [
    { date: '01 Aug', value: 58 },
    { date: '02 Aug', value: 70 },
    { date: '03 Aug', value: 58 },
    { date: '04 Aug', value: 72 },
    { date: '07 Aug', value: 91, highlight: true },
    { date: '08 Aug', value: 52 },
    { date: '09 Aug', value: 70 },
    { date: '10 Aug', value: 38 },
    { date: '11 Aug', value: 48 },
    { date: '14 Aug', value: 68 },
    { date: '15 Aug', value: 58 },
    { date: '16 Aug', value: 62 }
  ],
  Weekly: [
    { date: 'Week 1', value: 65 },
    { date: 'Week 2', value: 78, highlight: true },
    { date: 'Week 3', value: 52 },
    { date: 'Week 4', value: 63 }
  ],
  Monthly: [
    { date: 'Jan', value: 62 },
    { date: 'Feb', value: 70 },
    { date: 'Mar', value: 85, highlight: true },
    { date: 'Apr', value: 75 },
    { date: 'May', value: 68 },
    { date: 'Jun', value: 72 }
  ]
};

type TimeRange = 'Daily' | 'Weekly' | 'Monthly';

const AttendanceChart = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('Daily');

  interface CustomTooltipProps {
    active?: boolean;
    payload?: { value: number }[];
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-100">
          <p className="font-medium text-sm">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Get current data based on selected time range
  const currentData = timeRangeData[selectedRange];

  return (
    <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Attendance Comparison Chart
        </h2>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            {['Daily', 'Weekly', 'Monthly'].map((range) => (
              <label
                key={range}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="timeRange"
                  checked={selectedRange === range}
                  onChange={() => setSelectedRange(range as TimeRange)}
                  className="w-4 h-4 text-blue-600 cursor-pointer accent-blue-600"
                />
                <span className="text-sm text-gray-600">{range}</span>
              </label>
            ))}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
            />
            <YAxis
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#818CF8"
              strokeWidth={2}
              dot={(props: { cx: number; cy: number; index: number }) => {
                const highlight = currentData[props.index]?.highlight;
                return (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={highlight ? 6 : 4}
                    fill={highlight ? '#818CF8' : '#FFF'}
                    stroke="#818CF8"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;