import React, { useState } from "react";
import PropTypes from "prop-types";
import { FcFeedback } from "react-icons/fc";
import { FaPaperPlane } from "react-icons/fa";
import InfoBubble from "./InfoBubble";
import GeminiSummarySection from "./Gemini Summary/gemini_summary";
import VirusTotalAnalysis from "../Components/APIs/virustotal";
import TrustLensSecurityCheck from "./Security Check/DomainSecurity";
import FeedbackFormPopup from "./popupFeedbackForm";

const UrlAnalysis = ({
  extractedUrl,
  safetyStatus,
  isAnalysisOpen,
  toggleAnalysis,
  isLoading,
  gemini_summary,
}) => {
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false);

  const mapOverallSafetyStatus = (backendStatus) => {
    if (backendStatus === "Unknown" || backendStatus === "URL DOES NOT EXIST") {
      return "URL Unknown";
    }
    return backendStatus;
  };

  const overallSafetyStatus = safetyStatus.overall
    ? mapOverallSafetyStatus(safetyStatus.overall)
    : "Unknown";

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

  const isUrlNonExistent =
    safetyStatus.details?.url_info?.status === "Non-existent";

  // Map block_status to user-friendly display text and styling
  const getBlockStatusDisplay = (blockStatus) => {
    const statusMap = {
      blocked: { text: "Blocked", className: "text-green-600" },
      already_blocked: { text: "Blocked", className: "text-green-600" },
      permission_denied: {
        text: "Failed - Permission Denied",
        className: "text-red-600",
      },
      error: { text: "Failed - Error", className: "text-red-600" },
      invalid_url: { text: "Failed - Invalid URL", className: "text-red-600" },
      no_uid: {
        text: "Not Blocked - Login Required",
        className: "text-yellow-600",
      },
    };
    return (
      statusMap[blockStatus] || { text: "Not Blocked", className: "text-gray-600" }
    );
  };

  const blockStatusDisplay = safetyStatus.details?.url_info?.block_status
    ? getBlockStatusDisplay(safetyStatus.details.url_info.block_status)
    : { text: "Not Blocked", className: "text-gray-600" };

  return (
    <div
      className={`w-full ${backgroundColorClass} rounded-lg overflow-hidden shadow-lg relative`}
    >
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-4 flex justify-between items-center cursor-pointer shadow-md"
        onClick={toggleAnalysis}
      >
        <h2 className="font-bold text-xl ml-1">URL ANALYSIS</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform duration-300 ${
            isAnalysisOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-y-auto ${
          isAnalysisOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
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
            <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
              <h3 className="font-semibold text-lg mb-1 text-gray-800">
                Overall Safety Status
              </h3>
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

              {overallSafetyStatus === "Unsafe" && (
                <p>
                  Block Status:{" "}
                  <span
                    className={`font-medium ${blockStatusDisplay.className}`}
                  >
                    {blockStatusDisplay.text}
                  </span>
                  {blockStatusDisplay.text === "Not Blocked - Login Required" && (
                    <span className="text-sm text-yellow-600 ml-2">
                      (Please log in to enable blocking)
                    </span>
                  )}
                </p>
              )}
              {!isUrlNonExistent && gemini_summary && (
                <GeminiSummarySection gemini_summary={gemini_summary} />
              )}
            </div>

            {!isUrlNonExistent && safetyStatus.details?.virustotal?.status && (
              <VirusTotalAnalysis
                safetyStatus={safetyStatus}
                extractedUrl={extractedUrl}
              />
            )}

            {safetyStatus.details?.url_info && (
              <TrustLensSecurityCheck
                safetyStatus={safetyStatus}
                extractedUrl={extractedUrl}
              />
            )}

            {!isUrlNonExistent && safetyStatus.details?.url_info && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => setIsFeedbackPopupOpen(true)}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none"
                >
                  <FaPaperPlane className="mr-2" />
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-blue-500 font-bold">
            START SCANNING TO GET URL ANALYSIS
          </div>
        )}
      </div>

      <FeedbackFormPopup
        isOpen={isFeedbackPopupOpen}
        onClose={() => setIsFeedbackPopupOpen(false)}
        url={extractedUrl || ""}
        userId={userId} // Pass userId to feedback form if needed
      />
    </div>
  );
};

UrlAnalysis.propTypes = {
  extractedUrl: PropTypes.string,
  gemini_summary: PropTypes.string,
  safetyStatus: PropTypes.shape({
    overall: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.shape({
      virustotal: PropTypes.object,
      url_info: PropTypes.shape({
        status: PropTypes.string,
        block_status: PropTypes.string,
      }),
    }),
  }),
  isAnalysisOpen: PropTypes.bool.isRequired,
  toggleAnalysis: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  userId: PropTypes.string, // New prop for user authentication status
};

export default UrlAnalysis;