import React, { useState } from "react";
import PropTypes from "prop-types";
import InfoBubble from "../InfoBubble";
import VirusTotalFullResultPopup from "./popupvirustotal";

const VirusTotalAnalysis = ({
  safetyStatus,
  extractedUrl,
  showDisclaimer,
  maliciousEngineCount,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const formatMessage = (message) => {
    if (!message) return "No additional details available.";
    const maxLength = 100;
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  // Check if virustotal data exists
  const virustotal = safetyStatus.details.virustotal || {};
  const status = virustotal.status || "Not Scanned";
  const message = virustotal.message || "VirusTotal scan was not performed.";
  const isUnsafe = status === "Unsafe";
  const isPotentiallyUnsafe = status === "Potentially Unsafe";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
      <div className="flex items-center mb-3">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
            status === "Safe"
              ? "bg-green-500"
              : status === "Potentially Unsafe"
              ? "bg-yellow-500"
              : status === "Not Scanned"
              ? "bg-gray-500"
              : "bg-red-500"
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
          ) : status === "Not Scanned" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
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
        <InfoBubble apiName="VirusTotal" />
      </div>

      <div className="ml-8 space-y-3">
        {(isUnsafe || isPotentiallyUnsafe) && message ? (
          <div className="border border-gray-200 rounded-lg p-3 w-fit bg-gray-50 shadow-sm">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Malicious Detections:</span>{" "}
              <span className="text-red-600 font-medium">
                {message.match(/Malicious detections: (\d+)/)?.[1] || "0"}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Suspicious Detections:</span>{" "}
              <span className="text-yellow-600 font-medium">
                {message.match(/Suspicious detections?: (\d+)/)?.[1] ||
                  message.match(/Suspicious: (\d+)/)?.[1] ||
                  "0"}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">{formatMessage(message)}</p>
        )}

        <p className="text-gray-700">
          Safety Status:{" "}
          <span
            className={`font-medium ${
              status === "Safe"
                ? "text-green-600"
                : status === "Potentially Unsafe"
                ? "text-yellow-600"
                : status === "Not Scanned"
                ? "text-gray-600"
                : "text-red-600"
            }`}
          >
            {status === "Safe"
              ? "Safe"
              : status === "Potentially Unsafe"
              ? "Potentially Unsafe"
              : status === "Not Scanned"
              ? "Not Scanned"
              : "Unsafe"}
          </span>
        </p>

        {showDisclaimer && (
          <p className="text-yellow-600 text-sm">
            Disclaimer: Only {maliciousEngineCount} security engine
            {maliciousEngineCount > 1 ? "s" : ""} deemed this URL as unsafe,
            while TrustLens Domain Security Check marked it as safe. You may
            optionally continue browsing with precaution.
          </p>
        )}

        {status !== "Not Scanned" && (
          <div className="text-xs text-blue-600">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="hover:underline focus:outline-none"
            >
              Click here to view full report &gt;&gt;
            </button>
          </div>
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
        stats: PropTypes.shape({
          malicious: PropTypes.number,
        }),
      }),
    }),
  }).isRequired,
  extractedUrl: PropTypes.string.isRequired,
  showDisclaimer: PropTypes.bool,
  maliciousEngineCount: PropTypes.number,
};

export default VirusTotalAnalysis;
