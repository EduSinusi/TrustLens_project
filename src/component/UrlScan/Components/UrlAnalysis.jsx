import React from "react";
import PropTypes from "prop-types";
import ApiInfoBubble from "../Components/ApiInfoBubble";
import VirusTotalAnalysis from "../Components/APIs/virustotal";

const UrlAnalysis = ({ extractedUrl, safetyStatus, isAnalysisOpen, toggleAnalysis, isLoading }) => {
  const determineOverallSafetyStatus = () => {
    const apiResults = [
      safetyStatus.details.virustotal?.status,
    ];

    // If any API returns "Unsafe", the overall status is "Unsafe"
    if (apiResults.some((status) => status === "Unsafe")) {
      return "Unsafe";
    }
    // If all APIs return "Safe", the overall status is "Safe"
    if (apiResults.every((status) => status === "Safe")) {
      return "Safe";
    }
    // If there are any "Error", "Unknown", or "Pending" statuses, the overall status is "Unknown"
    if (apiResults.some((status) => status === "Error" || status === "Unknown" || status === "Pending")) {
      return "Unknown";
    }
    // Default to "Unknown" for any unexpected cases
    return "Unknown";
  };

  const getWhoisWarning = () => {
    const whoisMessage = safetyStatus.details.whois?.message || "N/A";
    let warning = null;

    if (whoisMessage === "N/A" || !whoisMessage) {
      return "Warning: Lack of historical data for this domain. This may indicate a lack of legitimacy.";
    }

    const ageMatch = whoisMessage.match(/\((\d+) days old\)/);
    if (ageMatch) {
      const daysOld = parseInt(ageMatch[1], 10);

      if (daysOld < 30) {
        return `Warning: This domain is newly registered (${daysOld} days old). Newly registered domains are often vulnerable for phishing, scams, or malware distribution. \p Please proceed with caution.`;
      }
    }

    return null;
  };

  const overallSafetyStatus = determineOverallSafetyStatus();
  const whoisWarning = getWhoisWarning();

  // Determine the background color based on overallSafetyStatus
  const backgroundColorClass =
    overallSafetyStatus === "Safe" || "Unknown"
      ? "bg-gradient-to-br from-blue-50 to-blue-100"
      : overallSafetyStatus === "Unsafe"
      ? "bg-gradient-to-br from-red-50 to-red-100"
      : "bg-gradient-to-br from-yellow-50 to-yellow-100";

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
            {/* Overall Safety Status and WHOIS Warning */}
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
                      : "text-yellow-600"
                  }`}
                >
                  {overallSafetyStatus}
                </span>
              </p>
              {overallSafetyStatus === "Safe" && whoisWarning && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                  <p>{whoisWarning}</p>
                </div>
              )}
            </div>

            {/* VirusTotal */}
            {safetyStatus.details.virustotal && (
              <VirusTotalAnalysis safetyStatus={safetyStatus} extractedUrl={extractedUrl} />
            )}

            {/* WHOIS Database */}
            {safetyStatus.details.whois && (
              <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">WHOIS Database</span>
                  <ApiInfoBubble apiName="WHOIS Database" />
                </div>
                <div className="ml-8">
                  <p className="text-sm text-gray-600">{safetyStatus.details.whois.message || "N/A"}</p>
                </div>
              </div>
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
    details: PropTypes.object,
  }),
  isAnalysisOpen: PropTypes.bool.isRequired,
  toggleAnalysis: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default UrlAnalysis;