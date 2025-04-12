// UrlResult.jsx
import React from "react";
import PropTypes from "prop-types";

const UrlResult = ({ extractedUrl, safetyStatus }) => {
  const displayStatus = safetyStatus.overall === "URL Not Exist" ? "URL Not Exist" : safetyStatus.overall;

  return (
    <div className="px-3 py-3 bg-blue-100 rounded-lg border-t border-blue-200">
      <div className="flex mb-2">
        <div className="bg-gradient-to-t from-blue-200 to-blue-300 text-blue-900 px-4 py-1 rounded-l-md text-lg font-semibold shadow-sm">
          Extracted URL
        </div>
        <div className="flex-1 bg-white px-3 py-1 rounded-r-md overflow-hidden text-lg shadow-sm">
          {extractedUrl || "No URL detected"}
        </div>
      </div>

      <div className="flex">
        <div className="bg-gradient-to-t from-blue-200 to-blue-300 text-blue-900 px-5 py-1 rounded-l-md text-lg font-semibold shadow-sm">
          Safety Status
        </div>
        <div
          className={`flex-1 px-3 py-1 rounded-r-md text-lg font-bold shadow-sm ${
            displayStatus === "Safe"
              ? "bg-gradient-to-r from-green-100 to-green-50 text-green-800"
              : displayStatus === "Unsafe"
              ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800"
              : displayStatus === "URL Not Exist"
              ? "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800"
              : "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800"
          }`}
        >
          {displayStatus || "Unknown"}
        </div>
      </div>
    </div>
  );
};

UrlResult.propTypes = {
  extractedUrl: PropTypes.string,
  safetyStatus: PropTypes.shape({
    overall: PropTypes.string,
    details: PropTypes.object,
  }),
};

export default UrlResult;