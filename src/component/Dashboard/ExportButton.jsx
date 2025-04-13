// ExportButton.jsx
import React from "react";
import { FaDownload } from "react-icons/fa";
import Papa from "papaparse";

const ExportButton = ({ recentScans, statusFilter, dateRange, user }) => {
  const handleExport = () => {
    const filteredScans = recentScans.filter((scan) => {
      const matchesStatus =
        statusFilter === "All" || scan.safety_status.overall === statusFilter;
      if (dateRange === "All") return matchesStatus;
      const scanDate = new Date(scan.timestamp);
      const now = new Date();
      if (dateRange === "Last 7 Days") {
        return (
          matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 7))
        );
      }
      if (dateRange === "Last 30 Days") {
        return (
          matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 30))
        );
      }
      return matchesStatus;
    });

    const csvData = filteredScans.map((scan) => ({
      URL: scan.url,
      Status: scan.safety_status.overall,
      SecurityScore:
        scan.safety_status.details?.url_info?.security_score ?? "N/A",
      GeoIP:
        scan.safety_status.details?.url_info?.checks?.find(
          (c) => c.check === "GeoIP Location"
        )?.status ?? "N/A",
      Timestamp: scan.timestamp.toLocaleString(),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trustlens_scans_${user.uid}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={handleExport}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
      >
        <FaDownload className="mr-2" />
        Export Data
      </button>
    </div>
  );
};

export default ExportButton;
