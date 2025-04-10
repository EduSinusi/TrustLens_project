import React from "react";
import PropTypes from "prop-types";
import ApiInfoBubble from "../Components/ApiInfoBubble";
import VirusTotalAnalysis from "../Components/APIs/virustotal";
import TrustLensSecurityCheck from "../Components/Security Check/TrustLensSecurityCheck";

const UrlAnalysis = ({ extractedUrl, safetyStatus, isAnalysisOpen, toggleAnalysis, isLoading }) => {
  // Map the backend overall safety status to the front-end display value
  const mapOverallSafetyStatus = (backendStatus) => {
    if (backendStatus === "Unknown" || backendStatus === "URL DOES NOT EXIST") {
      return "URL Unknown"; // Display "URL Unknown" for non-existent domains
    }
    return backendStatus; // Use the backend status directly for other cases
  };

  const overallSafetyStatus = safetyStatus.overall
    ? mapOverallSafetyStatus(safetyStatus.overall)
    : "Unknown"; // Fallback to "Unknown" if safetyStatus.overall is not set

  // Determine the background color based on overallSafetyStatus
  const backgroundColorClass =
    overallSafetyStatus === "Safe"
      ? "bg-gradient-to-br from-green-50 to-green-100"
      : overallSafetyStatus === "Unsafe"
      ? "bg-gradient-to-br from-red-50 to-red-100"
      : overallSafetyStatus === "URL Unknown"
      ? "bg-gradient-to-br from-gray-50 to-gray-100"
      : overallSafetyStatus === "Unknown"
      ? "bg-gradient-to-br from-blue-50 to-blue-100"
      : "bg-gradient-to-br from-yellow-50 to-yellow-100";

  // Check if URL is non-existent (based on backend overall status or TrustLens status)
  const isUrlNonExistent =
    safetyStatus.details?.url_info?.status === "Non-existent";

  return (
    <div className={`w-full ${backgroundColorClass} rounded-lg overflow-hidden shadow-lg`}>
      {/* Dropdown Header */}
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-4 flex justify-between items-center cursor-pointer shadow-md"
        onClick={toggleAnalysis}
      >
        <h2 className="font-bold text-xl ml-1">URL ANALYSIS</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform duration-300 ${isAnalysisOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </div>

      {/* Dropdown Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-y-auto ${
          isAnalysisOpen ? "max-h-130 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-blue-500 font-medium">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p>Evaluating URL...</p>
          </div>
        ) : extractedUrl ? (
          <div className="p-4 space-y-4">
            {/* Overall Safety Status */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
              <h3 className="font-semibold text-gray-800">Overall Safety Status</h3>
              <p className="text-gray-700">
                Status:{" "}
                <span
                  className={`font-medium ${
                    overallSafetyStatus === "Safe"
                      ? "text-green-600"
                      : overallSafetyStatus === "Unsafe"
                      ? "text-red-600"
                      : overallSafetyStatus === "URL Unknown"
                      ? "text-gray-600"
                      : overallSafetyStatus === "Unknown"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {overallSafetyStatus}
                </span>
              </p>
            </div>

            {/* VirusTotal (only show if URL exists and VirusTotal result is present) */}
            {!isUrlNonExistent && safetyStatus.details?.virustotal?.status && (
              <VirusTotalAnalysis safetyStatus={safetyStatus} extractedUrl={extractedUrl} />
            )}

            {/* TrustLens URL Security Status Check */}
            {safetyStatus.details?.url_info && (
              <TrustLensSecurityCheck
                safetyStatus={safetyStatus}
                extractedUrl={extractedUrl}
              />
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-blue-500 font-bold">
            START SCANNING TO GET URL ANALYSIS
          </div>
        )}
      </div>
    </div>
  );
};

UrlAnalysis.propTypes = {
  extractedUrl: PropTypes.string,
  safetyStatus: PropTypes.shape({
    overall: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.object,
  }),
  isAnalysisOpen: PropTypes.bool.isRequired,
  toggleAnalysis: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default UrlAnalysis;