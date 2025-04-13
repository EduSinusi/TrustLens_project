// ScanTrendsLineChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const ScanTrendsLineChart = ({ scanTrends, className }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Scan Frequency Over Time
      </h2>
      <LineChart width={600} height={200} data={scanTrends}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#3B82F6" />
      </LineChart>
    </div>
  );
};

export default ScanTrendsLineChart;
