import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

const SafetyPieChart = ({ safetyBreakdown }) => {
  const pieData = [
    { name: "Safe", value: safetyBreakdown.Safe },
    { name: "Unsafe", value: safetyBreakdown.Unsafe },
    { name: "Potentially Unsafe", value: safetyBreakdown.PotentiallyUnsafe },
    { name: "Non-existent", value: safetyBreakdown.Nonexistent },
  ];

  // Modern color palette
  const COLORS = {
    Safe: "#34D399",            // Vibrant green
    Unsafe: "#F87171",          // Softer red
    "Potentially Unsafe": "#FBBF24", // Bright amber
    "Non-existent": "#6B7280",   // Neutral gray
  };

  // Custom label to show percentage inside the slice
  const renderLabel = ({ name, percent }) =>
    percent > 0
      ? `${name}: ${(percent * 100).toFixed(0)}%`
      : "";

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Safety Status Distribution
      </h2>
      <div className="w-full h-80 font-bold">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              labelLine={false}
              label={renderLabel}
              animationDuration={800}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || "#A1A1AA"}
                  className="transition-all duration-300 hover:brightness-110"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                fontFamily: "'Inter', sans-serif",
                color: "#111827"
              }}
              itemStyle={{ color: "#111827" }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 12, fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SafetyPieChart;