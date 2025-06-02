import React from "react";
import PopupVirusTotalFirebase from "../../component/History/popupvirustotal (firebase)";
import TrustLensSecurityFullReportPopup from "../../component/UrlScan/Components/Security Check/popupDomainSecurity";

const OverallScanSection = ({ scans, selectedScan, setSelectedScan, isVirusTotalPopupOpen, setIsVirusTotalPopupOpen, isSecurityPopupOpen, setIsSecurityPopupOpen, toggleDetails }) => {
  const handleViewVirusTotal = (scan) => {
    setSelectedScan(scan);
    setIsVirusTotalPopupOpen(true);
  };

  const handleViewSecurityReport = (scan) => {
    setSelectedScan(scan);
    setIsSecurityPopupOpen(true);
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Overall Scan</h2>
      <div className="overflow-x-auto hover:bg-gray-50 transition-colors">
        <table className="w-full text-left text-md text-gray-600">
          <thead>
            <tr className="text-lg bg-blue-600 text-white font-semibold">
              <th className="py-3 px-4">URL</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <React.Fragment key={scan.id}>
                <tr className="border-t border-gray-200 hover:bg-gray-100 transition-colors">
                  <td className="py-3 px-4">{scan.url}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      scan.safety_status.overall === "Safe"
                        ? "text-green-600"
                        : scan.safety_status.overall === "Unsafe"
                        ? "text-red-600"
                        : scan.safety_status.overall === "Potentially Unsafe"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {scan.safety_status.overall || "Unknown"}
                  </td>
                  <td className="py-3 px-4 text-sm">{scan.timestamp.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewVirusTotal(scan)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        VirusTotal
                      </button>
                      <button
                        onClick={() => handleViewSecurityReport(scan)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                      >
                        Security Report
                      </button>
                      <button
                        onClick={() => toggleDetails(scan.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                      >
                        {scan.showDetails ? "Hide" : "Show"} Details
                      </button>
                    </div>
                  </td>
                </tr>
                {scan.showDetails && (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 bg-gray-50">
                      <div className="text-md text-gray-600">
                        <h4 className="font-semibold text-gray-700">Gemini Summary</h4>
                        <p>{scan.gemini_summary || "No summary available"}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {isVirusTotalPopupOpen && selectedScan && (
        <PopupVirusTotalFirebase
          isOpen={isVirusTotalPopupOpen}
          onClose={() => setIsVirusTotalPopupOpen(false)}
          scanId={selectedScan.id}
        />
      )}
      {isSecurityPopupOpen && selectedScan && (
        <TrustLensSecurityFullReportPopup
          isOpen={isSecurityPopupOpen}
          onClose={() => setIsSecurityPopupOpen(false)}
          urlSecurityResult={selectedScan.safety_status.details.url_info || {}}
        />
      )}
    </div>
  );
};

export default OverallScanSection;