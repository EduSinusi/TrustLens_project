import React from "react";
import PopupVirusTotalFirebase from "../../component/History/popupvirustotal (firebase)";
import TrustLensSecurityFullReportPopup from "../../component/UrlScan/Components/Security Check/popupDomainSecurity";

const PotentiallyUnsafeScanSection = ({
  scans,
  selectedScan,
  setSelectedScan,
  isVirusTotalPopupOpen,
  setIsVirusTotalPopupOpen,
  isSecurityPopupOpen,
  setIsSecurityPopupOpen,
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
        Potentially Unsafe Scan Results
      </h2>
      <div className="overflow-x-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
        <table className="w-full text-center text-md text-gray-600">
          <thead>
            <tr className="bg-yellow-500 text-lg text-white font-semibold rounded-t-3xl">
              <th className="py-4 px-6">Domain</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Score</th>
              <th className="py-4 px-6">Timestamp</th>
              <th className="py-4 px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan, index) => (
              <tr
                key={scan.id}
                className={`border-t border-gray-100 transition-all duration-200 ${
                  index % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"
                } hover:bg-gray-100/80`}
              >
                <td className="py-4 px-6 font-medium text-gray-800">
                  {scan.safety_status.details?.url_info?.details?.domain ||
                    scan.url}
                </td>
                <td className="py-4 px-6 text-yellow-600 font-semibold">
                  Potentially Unsafe
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {scan.safety_status.details?.url_info?.details
                    ?.security_score ?? "N/A"}
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
                <td className="py-4 px-6 align-center justify-center flex space-x-5">
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
                </td>
              </tr>
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

export default PotentiallyUnsafeScanSection;
