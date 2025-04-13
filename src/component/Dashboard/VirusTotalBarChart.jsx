// VirusTotalBarChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const VirusTotalBarChart = ({ virusTotalStats }) => {
  const barData = [
    { name: "Malicious", count: virusTotalStats.malicious },
    { name: "Harmless", count: virusTotalStats.harmless },
    { name: "Undetected", count: virusTotalStats.undetected },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        VirusTotal Detections
      </h2>
      <BarChart width={300} height={200} data={barData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#3B82F6" />
      </BarChart>
    </div>
  );
};

export default VirusTotalBarChart;
