// SummaryStats.jsx
import React from "react";
import { FaShieldAlt, FaGlobe } from "react-icons/fa";

const SummaryStats = ({ analyticsData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div className="flex items-center">
          <FaShieldAlt className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-700">Total Scans</h2>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {analyticsData.totalScans}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700">Blocked URLs</h2>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {analyticsData.blockedCount}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700">
          Avg. Security Score
        </h2>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {Math.round(analyticsData.avgSecurityScore) || "N/A"}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div className="flex items-center">
          <FaGlobe className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-700">
            Top GeoIP Location
          </h2>
        </div>
        <p className="text-xl font-bold text-gray-900 mt-2 truncate">
          {Object.entries(analyticsData.geoIpLocations).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0] || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default SummaryStats;
