// Filters.jsx
import React from "react";

const Filters = ({
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-md">
      <div className="flex items-center">
        <label className="text-gray-700 font-semibold mr-3">
          Status Filter:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Safe">Safe</option>
          <option value="Unsafe">Unsafe</option>
          <option value="Potentially Unsafe">Potentially Unsafe</option>
          <option value="URL does not exist">Non-existent</option>
        </select>
      </div>
      <div className="flex items-center">
        <label className="text-gray-700 font-semibold mr-3">Date Range:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Time</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
