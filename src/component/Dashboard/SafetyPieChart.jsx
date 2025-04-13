// SafetyPieChart.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const SafetyPieChart = ({ safetyBreakdown }) => {
  const pieData = [
    { name: "Safe", value: safetyBreakdown.Safe },
    { name: "Unsafe", value: safetyBreakdown.Unsafe },
    { name: "Potentially Unsafe", value: safetyBreakdown.PotentiallyUnsafe },
    { name: "Non-existent", value: safetyBreakdown.Nonexistent },
  ];
  const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6B7280"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Safety Status Distribution
      </h2>
      <PieChart width={300} height={200}>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default SafetyPieChart;
