// RecentScansTable.jsx
import React, { useState } from "react";

const RecentScansTable = ({
  recentScans,
  statusFilter,
  dateRange,
  setAnalyticsData,
}) => {
  const [isTableOpen, setIsTableOpen] = useState(false);

  const filteredScans = recentScans.filter((scan) => {
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
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Recent Scans</h2>
        <button
          onClick={() => setIsTableOpen(!isTableOpen)}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center text-sm font-medium"
        >
          {isTableOpen ? "Hide Details" : "Show Details"}
        </button>
      </div>
      {isTableOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Security Score</th>
                <th className="py-3 px-4">GeoIP Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan) => (
                <React.Fragment key={scan.id}>
                  <tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4">
                      {scan.safety_status.details?.url_info?.domain || scan.url}
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        scan.safety_status.overall === "Safe"
                          ? "text-green-600"
                          : scan.safety_status.overall === "Unsafe"
                          ? "text-red-600"
                          : scan.safety_status.overall === "Potentially Unsafe"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {scan.safety_status.overall}
                    </td>
                    <td className="py-3 px-4">
                      {scan.safety_status.details?.url_info?.security_score ??
                        "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {scan.safety_status.details?.url_info?.checks?.find(
                        (c) => c.check === "GeoIP Location"
                      )?.status || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {scan.timestamp.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          setAnalyticsData((prev) => ({
                            ...prev,
                            recentScans: prev.recentScans.map((s) =>
                              s.id === scan.id
                                ? { ...s, showDetails: !s.showDetails }
                                : s
                            ),
                          }))
                        }
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                      >
                        {scan.showDetails ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                  {scan.showDetails && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-700">
                              Checks
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {scan.safety_status.details?.url_info?.checks?.map(
                                (check, i) => (
                                  <li key={i}>
                                    {check.check}: {check.status} ({check.risk})
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700">
                              VirusTotal Engines
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {Object.entries(
                                scan.safety_status.details?.virustotal
                                  ?.scan_results || {}
                              ).map(
                                ([engine, result]) =>
                                  result.category === "malicious" && (
                                    <li key={engine}>
                                      {engine}: {result.result}
                                    </li>
                                  )
                              )}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentScansTable;
