// TopRiskyChecks.jsx
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const TopRiskyChecks = ({ topRiskyChecks }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <div className="flex items-center mb-4">
        <FaExclamationTriangle className="h-6 w-6 text-red-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-700">Top Risky Checks</h2>
      </div>
      {topRiskyChecks.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-gray-600">
          {topRiskyChecks.map((item, index) => (
            <li key={index}>
              {item.check}: Detected {item.count} times
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No high or critical risks detected.</p>
      )}
    </div>
  );
};

export default TopRiskyChecks;