import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecentScansTable = ({
  recentScans,
  statusFilter,
  dateRange,
  setAnalyticsData,
}) => {
  const [isTableOpen, setIsTableOpen] = useState(false);
  const navigate = useNavigate();

  const filteredScans = recentScans
    .filter((scan) => {
      const matchesStatus =
        statusFilter === "All" || scan.safety_status.overall === statusFilter;
      if (dateRange === "All") return matchesStatus;
      const scanDate = new Date(scan.timestamp);
      const now = new Date();
      if (dateRange === "Last 7 Days") {
        return (
          matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 7))
        );
      }
      if (dateRange === "Last 30 Days") {
        return (
          matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 30))
        );
      }
      return matchesStatus;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  const getDomain = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Recent Scans
        </h2>
        <button
          onClick={() => setIsTableOpen(!isTableOpen)}
          className="text-blue-600 hover:text-blue-800 transition-all duration-200 flex items-center text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
        >
          {isTableOpen ? "Hide Details" : "Show Details"}
        </button>
      </div>
      {isTableOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-md text-gray-600">
            <thead>
              <tr className="bg-gray-50 text-gray-800 font-semibold">
                <th className="py-4 px-6">Domain</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Gemini Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan, index) => (
                <tr
                  key={scan.id}
                  className={`border-t border-gray-100 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"
                  } hover:bg-gray-100/80`}
                >
                  <td className="py-4 px-6 font-medium text-gray-800">
                    {getDomain(scan.url)}
                  </td>
                  <td
                    className={`py-4 px-6 font-semibold ${
                      scan.safety_status.overall === "Safe"
                        ? "text-green-600"
                        : scan.safety_status.overall === "Unsafe"
                        ? "text-red-600"
                        : scan.safety_status.overall === "Potentially Unsafe"
                        ? "text-yellow-600"
                        : scan.safety_status.overall === "URL does not exist"
                        ? "text-gray-600"
                        : "text-gray-600"
                    }`}
                  >
                    {scan.safety_status.overall === "URL does not exist"
                      ? "Unknown"
                      : scan.safety_status.overall}
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {new Date(scan.timestamp).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {scan.gemini_summary || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/scan-history")}
              className="text-blue-600 hover:text-blue-800 transition-all duration-200 font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
            >
              View All Scan History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentScansTable;