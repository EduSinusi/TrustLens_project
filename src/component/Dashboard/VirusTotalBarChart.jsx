import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
  LabelList
} from "recharts";

const VirusTotalBarChart = ({ virusTotalStats }) => {
  // Modern color palette
  const COLORS = {
    Malicious: "#F87171",    // Softer red
    Harmless: "#34D399",     // Vibrant green
    Undetected: "#6B7280",   // Neutral gray
  };

  const barData = [
    { name: "Malicious", count: virusTotalStats.malicious },
    { name: "Harmless", count: virusTotalStats.harmless },
    { name: "Undetected", count: virusTotalStats.undetected },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        VirusTotal Detections
      </h2>
      <div className="w-full h-72 font-bold">
        <ResponsiveContainer>
          <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#4B5563", fontSize: 15, fontFamily: "'Inter', sans-serif" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4B5563", fontSize: 14, fontFamily: "'Inter', sans-serif" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
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
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontFamily: "'Inter', sans-serif", fontSize: 14 }}
            />
            <Bar
              dataKey="count"
              name="Count"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            >
              {barData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name]}
                  className="transition-all duration-300 hover:brightness-110"
                />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                formatter={(value) => (value !== 0 ? value : "")}
                style={{
                  fill: "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VirusTotalBarChart;