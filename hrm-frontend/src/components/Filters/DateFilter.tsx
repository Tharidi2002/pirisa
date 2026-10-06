import React from "react";

interface DateFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleClear = () => {
    onDateChange('');
  };

  return (
    <div className="mb-4 flex items-center space-x-2">
      <div className="flex items-center">
        <label htmlFor="date-filter" className="mr-2 text-sm font-medium">
          Filter by Date:
        </label>
        <input
          id="date-filter"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      {selectedDate && (
        <button
          onClick={handleClear}
          className="px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default DateFilter;
