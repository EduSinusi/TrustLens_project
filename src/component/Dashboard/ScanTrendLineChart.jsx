import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-100 rounded-xl shadow-lg">
        <p className="text-sm text-gray-800">{`Date: ${new Date(payload[0].payload.date).toLocaleDateString()}`}</p>
        <p className="text-sm text-gray-800 font-medium">{`Scans: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ScanTrendsLineChart = ({ scanTrends, className }) => {
  const sortedTrends = [...scanTrends].sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).replace(/(\d+) (\w+) (\d+)/, "$1 $2 '$3");
  };

  return (
    <div className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Scan Frequency Over Time
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={sortedTrends}
          margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            angle={-45}
            textAnchor="end"
            height={70}
            interval="preserveStartEnd"
            tick={{ fill: "#4B5563", fontSize: 12, fontFamily: "'Inter', sans-serif" }}
          />
          <YAxis
            domain={[0, 60]}
            ticks={[0, 15, 30, 45, 60]}
            tick={{ fill: "#4B5563", fontSize: 12, fontFamily: "'Inter', sans-serif" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4, fill: "#3B82F6" }}
            activeDot={{ r: 6, fill: "#1E40AF" }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScanTrendsLineChart;