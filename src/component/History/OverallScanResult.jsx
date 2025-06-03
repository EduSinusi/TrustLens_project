import React from "react";
import PopupVirusTotalFirebase from "../../component/History/popupvirustotal (firebase)";
import TrustLensSecurityFullReportPopup from "../../component/UrlScan/Components/Security Check/popupDomainSecurity";

const OverallScanSection = ({
  scans,
  selectedScan,
  setSelectedScan,
  isVirusTotalPopupOpen,
  setIsVirusTotalPopupOpen,
  isSecurityPopupOpen,
  setIsSecurityPopupOpen,
  toggleDetails,
}) => {
  const handleViewVirusTotal = (scan) => {
    setSelectedScan(scan);
    setIsVirusTotalPopupOpen(true);
  };

  const handleViewSecurityReport = (scan) => {
    setSelectedScan(scan);
    setIsSecurityPopupOpen(true);
  };

  return (
    <div className="mb-8">
      <h2 className="text-3xl ml-3 font-bold text-gray-800 tracking-tight mb-6">
        Overall Scan
      </h2>
      <div className="overflow-x-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl ">
        <table className="w-full text-center text-md text-gray-600">
          <thead>
            <tr className="bg-blue-500 text-white text-lg font-semibold">
              <th className="py-4 px-6">URL</th>
              <th className="py-4 px-6 ">Status</th>
              <th className="py-4 px-6 ">Timestamp</th>
              <th className="py-4 px-6 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan, index) => (
              <React.Fragment key={scan.id}>
                <tr
                  className={`border-t border-gray-100 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"
                  } hover:bg-gray-100/80`}
                >
                  <td className="py-4 px-6 w-[200px] font-medium text-gray-800">{scan.url}</td>
                  <td
                    className={`py-4 px-6 font-semibold ${
                      scan.safety_status.overall === "Safe"
                        ? "text-green-600"
                        : scan.safety_status.overall === "Unsafe"
                        ? "text-red-600"
                        : scan.safety_status.overall === "Potentially Unsafe"
                        ? "text-yellow-600"
                        : scan.safety_status.overall === "URL does not exist"
                        ? "text-gray-600"
                        : "text-gray-600"
                    }`}
                  >
                    {scan.safety_status.overall === "URL does not exist"
                      ? "Unknown"
                      : scan.safety_status.overall || "Unknown"}
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {new Date(scan.timestamp).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </td>
                  <td className="py-4 px-6 flex space-x-2 align-center justify-center">
                    <button
                      onClick={() => handleViewVirusTotal(scan)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200"
                    >
                      VirusTotal
                    </button>
                    <button
                      onClick={() => handleViewSecurityReport(scan)}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-200"
                    >
                      Security Report
                    </button>
                    <button
                      onClick={() => toggleDetails(scan.id)}
                      className="text-blue-600 hover:text-blue-800 transition-all duration-200 font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
                    >
                      {scan.showDetails ? "Hide Details" : "Show Details"}
                    </button>
                  </td>
                </tr>
                {scan.showDetails && (
                  <tr>
                    <td colSpan={4} className="py-4 px-6 bg-gray-50">
                      <div className="text-md text-gray-600">
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">Gemini Summary</h4>
                        <p className="text-[17px] text-left text-gray-800 mb-2">{scan.gemini_summary || "No summary available"}</p>
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