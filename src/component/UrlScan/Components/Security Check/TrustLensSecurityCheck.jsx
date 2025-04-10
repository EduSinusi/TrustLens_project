import React, { useState } from "react";
import PropTypes from "prop-types";
import ApiInfoBubble from "../ApiInfoBubble";
import TrustLensSecurityFullReportPopup from "./popupDomainSecurity";

const TrustLensSecurityCheck = ({ safetyStatus, extractedUrl }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Extract relevant data from safetyStatus.details.url_info
  const urlInfo = safetyStatus.details.url_info || {};
  const fullResult = urlInfo.details || {};

  // Extract domain name
  const domainName = fullResult.domain || "N/A";
  const status = urlInfo.status || "Unknown";

  // Determine if URL does not exist
  const isUrlNonExistent =
    safetyStatus.overall === "Unknown" ||
    safetyStatus.overall === "URL DOES NOT EXIST" ||
    safetyStatus.details?.url_info?.status === "Non-existent";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
      {/* Header with Icon and API Info Bubble */}
      <div className="flex items-center mb-3">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
            status === "Safe"
              ? "bg-green-500"
              : status === "Unsafe"
              ? "bg-red-500"
              : status === "Non-existent"
              ? "bg-gray-500"
              : "bg-yellow-500"
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
          ) : status === "Unsafe" ? (
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
          ) : status === "Non-existent" ? (
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
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <span className="font-medium text-gray-800">
          TrustLens Domain Security Checker
        </span>
        <ApiInfoBubble apiName="TrustLens URL Security Status Check" />
      </div>

      {/* Summary Information */}
      <div className="ml-8 space-y-3">
        {isUrlNonExistent ? (
          <>
            <p className="text-sm text-gray-600">
              Domain <span className="font-bold">{domainName}</span> does not
              exist
            </p>
            {/* Link to Full Report */}
            <div className="text-xs text-blue-600">
              <button
                onClick={() => setIsPopupOpen(true)}
                className="hover:underline focus:outline-none"
              >
                Click here to view full report &gt;&gt;
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Important Details in a Square Box */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Domain Name:</span>{" "}
                    {domainName}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">IPv4 Address:</span>{" "}
                    {fullResult.ip || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Domain Age:</span>{" "}
                    {fullResult.age_info?.days
                      ? `${fullResult.age_info.days} days (${fullResult.age_info.source})`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">GeoIP Location:</span>{" "}
                    {fullResult.checks?.find(
                      (check) => check.check === "GeoIP Location"
                    )?.status || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Risk Summary:</span>{" "}
                    {fullResult.risk_summary
                      ? `Critical: ${fullResult.risk_summary.critical}, High: ${fullResult.risk_summary.high}, Medium: ${fullResult.risk_summary.medium}, Low: ${fullResult.risk_summary.low}`
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Security Score:</span>{" "}
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        fullResult.security_score >= 25
                          ? "bg-green-100 text-green-700"
                          : fullResult.security_score < 25
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {fullResult.security_score || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Status and Message at the Bottom */}
            <div className="mt-3">
              <p className="text-gray-700">
                Safety Status:{" "}
                <span
                  className={`font-medium ${
                    status === "Safe"
                      ? "text-green-600"
                      : status === "Unsafe"
                      ? "text-red-600"
                      : status === "Non-existent"
                      ? "text-gray-600"
                      : "text-yellow-600"
                  }`}
                >
                  {status}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {urlInfo.message || "N/A"}
              </p>
            </div>

            {/* Link to Full Report */}
            <div className="text-xs text-blue-600 mt-2">
              <button
                onClick={() => setIsPopupOpen(true)}
                className="hover:underline focus:outline-none"
              >
                Click here to view full report &gt;&gt;
              </button>
            </div>
          </>
        )}
      </div>

      {/* Full Report Popup */}
      <TrustLensSecurityFullReportPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        urlSecurityResult={urlInfo}
      />
    </div>
  );
};

TrustLensSecurityCheck.propTypes = {
  safetyStatus: PropTypes.shape({
    overall: PropTypes.string,
    details: PropTypes.shape({
      url_info: PropTypes.shape({
        status: PropTypes.string,
        message: PropTypes.string,
        details: PropTypes.object,
      }),
    }),
  }).isRequired,
  extractedUrl: PropTypes.string.isRequired,
};

export default TrustLensSecurityCheck;
