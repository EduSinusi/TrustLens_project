import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const VirusTotalFullResultPopup = ({ isOpen, onClose, extractedUrl }) => {
  const [fullResult, setFullResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEngineResultsOpen, setIsEngineResultsOpen] = useState(false);

  const fetchFullResult = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/get_virustotal_full_result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extractedUrl }),
      });
      console.log("Fetch Response Status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch full VirusTotal result");
      }
      const data = await response.json();
      console.log("Fetch Response Data:", data);
      setFullResult(data.result);
    } catch (err) {
      console.error("Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && extractedUrl) {
      fetchFullResult();
    }
  }, [isOpen, extractedUrl]);

  // Function to capitalize each word
  const capitalizeEachWord = (str) => {
    if (!str) return "N/A";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Function to sort scan results
  const sortScanResults = (scanResults, overallStatus) => {
    const entries = Object.entries(scanResults);

    // Define threat type precedence
    const threatPrecedence = {
      phishing: 1,
      malware: 2,
      scam: 3,
      malicious: 4,
    };

    // Sort entries based on category and threat type
    return entries.sort((a, b) => {
      const [engineA, resultA] = a;
      const [engineB, resultB] = b;

      const categoryA = resultA.category || "undetected";
      const categoryB = resultB.category || "undetected";

      // If the overall status is "Unsafe", prioritize malicious scans
      if (overallStatus === "Unsafe") {
        if (categoryA === "malicious" && categoryB !== "malicious") return -1;
        if (categoryB === "malicious" && categoryA !== "malicious") return 1;
      }

      // Sort by category: malicious -> harmless -> undetected
      const categoryOrder = {
        malicious: 1,
        harmless: 2,
        undetected: 3,
      };
      const categorySort = (categoryOrder[categoryA] || 4) - (categoryOrder[categoryB] || 4);
      if (categorySort !== 0) return categorySort;

      // If categories are the same, sort by threat type (phishing > malware > scam > malicious)
      const threatA = resultA.result || "malicious";
      const threatB = resultB.result || "malicious";
      const threatOrderA = threatPrecedence[threatA.toLowerCase()] || 5;
      const threatOrderB = threatPrecedence[threatB.toLowerCase()] || 5;
      return threatOrderA - threatOrderB;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-1 pb-3">
          <h3 className="text-2xl ml-1 font-bold text-gray-800">VirusTotal Analysis Report</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
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
            <p className="ml-3 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-md mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Content */}
        {fullResult && !loading && !error && (
          <div className="space-y-6">
            {/* Stats Section */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Scan Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-600">Malicious</p>
                  <p className="text-lg font-medium text-red-600">{fullResult.stats?.malicious || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-600">Suspicious</p>
                  <p className="text-lg font-medium text-yellow-600">{fullResult.stats?.suspicious || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-600">Harmless</p>
                  <p className="text-lg font-medium text-green-600">{fullResult.stats?.harmless || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-600">Undetected</p>
                  <p className="text-lg font-medium text-gray-600">{fullResult.stats?.undetected || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-600">Timeout</p>
                  <p className="text-lg font-medium text-gray-600">{fullResult.stats?.timeout || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-600">Total Scans</p>
                  <p className="text-lg font-medium text-blue-600">
                    {fullResult.stats
                      ? (fullResult.stats.malicious || 0) +
                        (fullResult.stats.suspicious || 0) +
                        (fullResult.stats.harmless || 0) +
                        (fullResult.stats.undetected || 0) +
                        (fullResult.stats.timeout || 0)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Engine Results Section (Table) */}
            {fullResult.scan_results && Object.keys(fullResult.scan_results).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">Results By Security Engines</h4>
                  <button
                    onClick={() => setIsEngineResultsOpen(!isEngineResultsOpen)}
                    className="text-blue-600 hover:underline focus:outline-none text-sm flex items-center"
                  >
                    {isEngineResultsOpen ? "Hide Details" : "Show Details"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ml-1 transition-transform ${isEngineResultsOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {isEngineResultsOpen && (
                  <div className="max-h-84 overflow-y-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                      <thead className="text-md uppercase bg-blue-100 text-gray-800 sticky top-0">
                        <tr>
                          <th scope="col" className="px-4 py-3">Security Engine</th>
                          <th scope="col" className="px-4 py-3">Detection Method</th>
                          <th scope="col" className="px-4 py-3">Classification Category</th>
                          <th scope="col" className="px-4 py-3">Threat Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortScanResults(fullResult.scan_results, fullResult.status).map(([engine, result], index) => (
                          <tr
                            key={index}
                            className={`border-b ${
                              result.category === "malicious"
                                ? "bg-red-50"
                                : result.category === "harmless"
                                ? "bg-green-50"
                                : "bg-gray-50"
                            } hover:bg-gray-100`}
                          >
                            <td className="px-4 py-2 font-medium">{capitalizeEachWord(engine)}</td>
                            <td className="px-4 py-2">{capitalizeEachWord(result.method || "N/A")}</td>
                            <td
                              className={`px-4 py-2 font-medium ${
                                result.category === "malicious"
                                  ? "text-red-600"
                                  : result.category === "harmless"
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {capitalizeEachWord(result.category || "N/A")}
                            </td>
                            <td className="px-4 py-2">{capitalizeEachWord(result.result || "N/A")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Final Result Section */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Final Result</h4>
              <div className="flex items-center">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    fullResult.status === "Safe"
                      ? "bg-green-100 text-green-700"
                      : fullResult.status === "Unsafe"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {fullResult.status || "Unknown"}
                </span>
                <p className="ml-3 text-sm text-gray-600">{fullResult.message || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

VirusTotalFullResultPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  extractedUrl: PropTypes.string.isRequired,
};

export default VirusTotalFullResultPopup;