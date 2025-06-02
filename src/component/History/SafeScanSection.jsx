import React from "react";
import PopupVirusTotalFirebase from "../../component/History/popupvirustotal (firebase)";
import TrustLensSecurityFullReportPopup from "../../component/UrlScan/Components/Security Check/popupDomainSecurity";

const SafeScanSection = ({ scans, selectedScan, setSelectedScan, isVirusTotalPopupOpen, setIsVirusTotalPopupOpen, isSecurityPopupOpen, setIsSecurityPopupOpen }) => {
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
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Safe Scan Results</h2>
      <div className="overflow-x-auto hover:bg-gray-50 transition-colors">
        <table className="w-full text-left text-md text-gray-600">
          <thead>
            <tr className="bg-green-600 text-lg text-white font-semibold">
              <th className="py-3 px-4">Domain</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id} className="border-t border-gray-200 hover:bg-gray-100 transition-colors">
                <td className="py-3 px-4">
                  {scan.safety_status.details?.url_info?.details?.domain || scan.url}
                </td>
                <td className="py-3 px-4 text-green-600 font-medium">Safe</td>
                <td className="py-3 px-4">
                  {scan.safety_status.details?.url_info?.details?.security_score ?? "N/A"}
                </td>
                <td className="py-3 px-4">{scan.timestamp.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleViewVirusTotal(scan)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600 transition-colors"
                  >
                    VirusTotal
                  </button>
                  <button
                    onClick={() => handleViewSecurityReport(scan)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
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

export default SafeScanSection;