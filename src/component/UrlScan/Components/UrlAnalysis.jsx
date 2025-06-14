import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FcFeedback } from "react-icons/fc";
import { FaPaperPlane } from "react-icons/fa";
import InfoBubble from "./InfoBubble";
import GeminiSummarySection from "./Gemini Summary/gemini_summary";
import VirusTotalAnalysis from "../Components/APIs/virustotal";
import TrustLensSecurityCheck from "./Security Check/DomainSecurity";
import PersonalNotePopup from "./popupFeedbackForm";
import BlockUrlPopup from "./BlockUrlPopup";
import useAuth from "../../../firebase/useAuth";
import CommunityPopup from "./CommunityPopup"; // New import for community popup

const UrlAnalysis = ({
  extractedUrl,
  safetyStatus,
  isAnalysisOpen,
  toggleAnalysis,
  isLoading,
  gemini_summary,
  userId,
}) => {
  const [isNotePopupOpen, setIsNotePopupOpen] = useState(false);
  const [isBlockPopupOpen, setIsBlockPopupOpen] = useState(false);
  const [blockStatus, setBlockStatus] = useState(
    safetyStatus?.details?.url_info?.block_status || null
  );
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isBlocking, setIsBlocking] = useState(false);
  const [isCommunityPopupOpen, setIsCommunityPopupOpen] = useState(false); // New state for community popup
  const { fetchWithAuth, token, user } = useAuth();

  const mapOverallSafetyStatus = (backendStatus) => {
    if (backendStatus === "Unknown" || backendStatus === "URL DOES NOT EXIST") {
      return "URL Unknown";
    }
    return backendStatus;
  };

  const overallSafetyStatus = safetyStatus?.overall
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
    safetyStatus?.details?.url_info?.status === "Non-existent";

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
      statusMap[blockStatus] || {
        text: "Not Blocked",
        className: "text-gray-600",
      }
    );
  };

  const blockStatusDisplay = blockStatus
    ? getBlockStatusDisplay(blockStatus)
    : { text: "Not Blocked", className: "text-gray-600" };

  const maliciousEngineCount =
    safetyStatus?.details?.virustotal?.stats?.malicious || 0;

  const isTrustLensSafe = safetyStatus?.details?.url_info?.status === "Safe";

  useEffect(() => {
    console.log("Popup trigger conditions:", {
      overallSafetyStatus,
      userId,
      blockStatus,
      isBlockPopupOpen,
      tokenAvailable: !!token,
      userExists: !!user,
    });

    if (
      overallSafetyStatus === "Unsafe" &&
      userId &&
      !["blocked", "already_blocked"].includes(blockStatus)
    ) {
      console.log("Conditions met, showing popup");
      setIsBlockPopupOpen(true);
    } else {
      console.log("Conditions not met, hiding popup");
      setIsBlockPopupOpen(false);
    }
  }, [overallSafetyStatus, blockStatus, userId, token, user]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleBlockUrl = async () => {
    console.log("handleBlockUrl called, token available:", !!token);
    if (!token) {
      console.error("No token available, cannot block URL");
      setBlockStatus("no_uid");
      setIsBlockPopupOpen(false);
      setToast({
        show: true,
        message: "Please log in to block this URL",
        type: "error",
      });
      return;
    }

    setIsBlocking(true);
    try {
      const response = await fetchWithAuth("http://localhost:8000/block_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: extractedUrl }),
      });

      console.log("Block URL response status:", response.status);
      const data = await response.json();
      console.log("Block URL response data:", data);

      if (response.ok) {
        console.log(
          "Block successful, updating blockStatus to:",
          data.block_status
        );
        setBlockStatus(data.block_status);
        setIsBlockPopupOpen(false);
        setToast({
          show: true,
          message: "URL blocked successfully",
          type: "success",
        });
      } else {
        console.error("Failed to block URL:", data.detail);
        setBlockStatus("error");
        setToast({
          show: true,
          message: `Failed to block URL: ${data.detail || "Unknown error"}`,
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error blocking URL:", err.message);
      setBlockStatus("error");
      setToast({
        show: true,
        message: `Error blocking URL: ${err.message}`,
        type: "error",
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleClosePopup = () => {
    console.log("Closing block popup");
    setIsBlockPopupOpen(false);
  };

  return (
    <div
      className={`w-full ${backgroundColorClass} rounded-lg overflow-hidden shadow-lg relative`}
    >
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

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

            {!isUrlNonExistent && safetyStatus?.details?.virustotal?.status && (
              <VirusTotalAnalysis
                safetyStatus={safetyStatus}
                extractedUrl={extractedUrl}
                showDisclaimer={maliciousEngineCount > 0 && maliciousEngineCount < 5 && isTrustLensSafe}
                maliciousEngineCount={maliciousEngineCount}
              />
            )}

            {safetyStatus?.details?.url_info && (
              <TrustLensSecurityCheck
                safetyStatus={safetyStatus}
                extractedUrl={extractedUrl}
              />
            )}

            {!isUrlNonExistent && safetyStatus?.details?.url_info && userId && (
              <div>
                <div className="mt-2 flex justify-center">
                  <span className="text-gray-700 text-md font-semibold mr-3 flex justify-center items-center">
                    Want to add a note about this website?
                  </span>
                  <button
                    onClick={() => setIsNotePopupOpen(true)}
                    className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none"
                  >
                    <FaPaperPlane className="mr-2" />
                    Add Personal Note
                  </button>
                </div>
                <div className="mt-4 flex justify-center">
                  <span className="text-gray-700 text-md font-semibold mr-3 flex justify-center items-center">
                    Want to share a community comment?
                  </span>
                  <button
                    onClick={() => setIsCommunityPopupOpen(true)}
                    className="flex items-center px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-400 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none"
                  >
                    <FcFeedback className="mr-2" />
                    Add Community Comment
                  </button>
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

      <PersonalNotePopup
        isOpen={isNotePopupOpen}
        onClose={() => setIsNotePopupOpen(false)}
        url={extractedUrl || ""}
      />

      <BlockUrlPopup
        isOpen={isBlockPopupOpen}
        onClose={handleClosePopup}
        onBlock={handleBlockUrl}
        url={extractedUrl || ""}
        isBlocking={isBlocking}
        maliciousEngineCount={maliciousEngineCount}
      />

      <CommunityPopup
        isOpen={isCommunityPopupOpen}
        onClose={() => setIsCommunityPopupOpen(false)}
        url={extractedUrl || ""}
        userId={userId}
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
      virustotal: PropTypes.shape({
        status: PropTypes.string,
        message: PropTypes.string,
        stats: PropTypes.shape({
          malicious: PropTypes.number,
        }),
      }),
      url_info: PropTypes.shape({
        status: PropTypes.string,
        block_status: PropTypes.string,
      }),
    }),
  }),
  isAnalysisOpen: PropTypes.bool.isRequired,
  toggleAnalysis: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  userId: PropTypes.string,
};

export default UrlAnalysis;