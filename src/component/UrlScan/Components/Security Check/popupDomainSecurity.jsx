import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const TrustLensSecurityFullReportPopup = ({
  isOpen,
  onClose,
  urlSecurityResult,
}) => {
  const [isChecksOpen, setIsChecksOpen] = useState(false);
  const popupRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !urlSecurityResult) return null;

  const { status, message, details } = urlSecurityResult;
  const { domain, ip, ipv6, age_info, checks, risk_summary, security_score } =
    details || {};

  const isUrlNonExistent = status === "Non-existent";

  const dnsResolutionResult = isUrlNonExistent
    ? {
        check: "DNS Resolution",
        status: "Non-existent",
        risk: "N/A",
        explanation: [
          "Domain does not exist in DNS.",
          "Possible typo or unregistered domain.",
          "Recommendation: Verify the domain name or contact the domain owner.",
        ],
      }
    : checks?.find((check) => check.check === "DNS Resolution") || {};

  const riskPrecedence = { critical: 1, high: 2, medium: 3, low: 4 };
  const sortedChecks = checks
    ?.slice()
    .sort(
      (a, b) => (riskPrecedence[a.risk] || 5) - (riskPrecedence[b.risk] || 5)
    );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="fixed top-6 right-97 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors z-50 bg-white rounded-full p-2 shadow-md"
          aria-label="Close popup"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="space-y-6">
          {/* Domain Name Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Domain Information
            </h4>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-600">Domain Name</p>
              <p className="text-lg font-medium text-gray-800">
                {domain || "N/A"}
              </p>
            </div>
          </div>

          {/* DNS Resolution Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              DNS Resolution Result
            </h4>
            <div
              className={`p-4 rounded-lg shadow-sm border ${
                dnsResolutionResult.status === "Non-existent"
                  ? "border-gray-200 bg-gray-50"
                  : dnsResolutionResult.risk === "critical" ||
                    dnsResolutionResult.risk === "high"
                  ? "border-red-200 bg-red-50"
                  : dnsResolutionResult.risk === "medium"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <h3 className="font-semibold text-gray-800">
                {dnsResolutionResult.check}
              </h3>
              <p className="text-sm text-gray-600">
                Status: {dnsResolutionResult.status}
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                {dnsResolutionResult.explanation.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Details for Existing URLs */}
          {!isUrlNonExistent && (
            <>
              {/* Overview Section */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">
                  Overview
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">IPv4 Address</p>
                    <p className="text-lg font-medium text-gray-800">
                      {ip || "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">IPv6 Addresses</p>
                    <p className="text-lg font-medium text-gray-800">
                      {ipv6?.length > 0 ? ipv6.join(", ") : "N/A"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Domain Age</p>
                    <p className="text-lg font-medium text-gray-800">
                      {age_info?.days
                        ? `${age_info.days} days (${age_info.source}${
                            age_info.historical ? ", Historical Data" : ""
                          })`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Summary Section */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">
                  Risk Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Critical Risks</p>
                    <p className="text-lg font-medium text-red-600">
                      {risk_summary?.critical || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">High Risks</p>
                    <p className="text-lg font-medium text-orange-600">
                      {risk_summary?.high || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Medium Risks</p>
                    <p className="text-lg font-medium text-yellow-600">
                      {risk_summary?.medium || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-600">Low Risks</p>
                    <p className="text-lg font-medium text-green-600">
                      {risk_summary?.low || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Score Section */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">
                  Security Score
                </h4>
                <div className="flex items-center">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      security_score >= 25
                        ? "bg-green-100 text-green-700"
                        : security_score < 25
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {security_score || "N/A"}
                  </span>
                </div>
              </div>

              {/* Detailed Checks Section */}
              {sortedChecks && sortedChecks.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-700">
                      Detailed Security Checks
                    </h4>
                    <button
                      onClick={() => setIsChecksOpen(!isChecksOpen)}
                      className="text-blue-600 hover:underline focus:outline-none text-sm flex items-center"
                    >
                      {isChecksOpen ? "Hide Details" : "Show Details"}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ml-1 transition-transform ${
                          isChecksOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  {isChecksOpen && (
                    <div className="max-h-100 overflow-y-auto">
                      <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                            <th className="py-3 px-4 text-left w-28">
                              Security Risk
                            </th>
                            <th className="py-3 px-4 text-left w-36">
                              Scan Type
                            </th>
                            <th className="py-3 px-4 text-left w-28">Status</th>
                            <th className="py-3 px-4 text-left w-96">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedChecks.map((check, index) => (
                            <tr
                              key={index}
                              className={`border-t border-gray-200 ${
                                check.risk === "critical"
                                  ? "bg-red-50"
                                  : check.risk === "high"
                                  ? "bg-orange-50"
                                  : check.risk === "medium"
                                  ? "bg-yellow-50"
                                  : "bg-blue-50"
                              }`}
                            >
                              <td className="py-3 px-4 w-28">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    check.risk === "critical"
                                      ? "bg-red-200 text-red-800"
                                      : check.risk === "high"
                                      ? "bg-orange-200 text-orange-800"
                                      : check.risk === "medium"
                                      ? "bg-yellow-200 text-yellow-800"
                                      : "bg-blue-200 text-blue-800"
                                  }`}
                                >
                                  {check.risk.charAt(0).toUpperCase() +
                                    check.risk.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-800 font-medium w-36">
                                {check.check}
                              </td>
                              <td className="py-3 px-4 text-gray-600 w-28">
                                {check.status}
                              </td>
                              <td className="py-3 px-4 text-gray-600 w-96">
                                <ul className="list-disc list-inside text-sm">
                                  {check.explanation.map((exp, i) => (
                                    <li key={i}>{exp}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Final Result Section */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Final Result
            </h4>
            <div className="flex items-center">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  status === "Safe"
                    ? "bg-green-100 text-green-700"
                    : status === "Unsafe"
                    ? "bg-red-100 text-red-700"
                    : status === "Potentially Unsafe"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Non-existent"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {status || "Unknown"}
              </span>
              <p className="ml-3 text-sm text-gray-600">{message || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TrustLensSecurityFullReportPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  urlSecurityResult: PropTypes.shape({
    status: PropTypes.string,
    message: PropTypes.string,
    details: PropTypes.object,
  }),
};

export default TrustLensSecurityFullReportPopup;