import React, { useState } from "react";
import PropTypes from "prop-types";
import ApiInfoBubble from "../ApiInfoBubble";
import VirusTotalFullResultPopup from "./popupvirustotal";

const VirusTotalAnalysis = ({ safetyStatus, extractedUrl }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const formatMessage = (message) => {
    if (!message) return "No additional details available.";
    const maxLength = 100;
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  const status = safetyStatus.details.virustotal.status;
  const message = safetyStatus.details.virustotal.message;
  const isUnsafe = status === "Unsafe";

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
      <div className="flex items-center mb-2">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
            status === "Safe" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {status === "Safe" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span className="font-medium text-gray-800">VirusTotal</span>
        <ApiInfoBubble apiName="VirusTotal" />
      </div>
      <div className="ml-8">
        {isUnsafe && message && (
          <div className="bg-gray-50 p-2 rounded-md mb-2">
            <p className="text-md font-bold text-gray-700">
              Stats: Malicious:{" "}
              {message.match(/Malicious detections: (\d+)/)?.[1] || "N/A"},
              Suspicious: {message.match(/Suspicious: (\d+)/)?.[1] || "0"}
            </p>
          </div>
        )}
        <div className="text-xs text-blue-600">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="hover:underline focus:outline-none"
          >
            view full scan result >>
          </button>
        </div>
        <p className="mt-2 text-gray-700">
          Safety Status:{" "}
          <span
            className={`font-medium ${
              status === "Safe" ? "text-green-600" : "text-red-600"
            }`}
          >
            {status === "Safe" ? "Safe" : "Unsafe"}
          </span>
        </p>
        {message && !isUnsafe && (
          <p className="text-sm text-gray-600">{formatMessage(message)}</p>
        )}
      </div>

      <VirusTotalFullResultPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        extractedUrl={extractedUrl}
      />
    </div>
  );
};

VirusTotalAnalysis.propTypes = {
  safetyStatus: PropTypes.shape({
    details: PropTypes.shape({
      virustotal: PropTypes.shape({
        status: PropTypes.string,
        message: PropTypes.string,
      }),
    }),
  }).isRequired,
  extractedUrl: PropTypes.string.isRequired,
};

export default VirusTotalAnalysis;
