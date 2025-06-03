import React, { useState } from "react";
import { FaDownload } from "react-icons/fa";
import Papa from "papaparse";

const ExportButton = ({ recentScans, statusFilter, dateRange, user }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    // Filter scans based on status and date range
    const filteredScans = recentScans.filter((scan) => {
      const matchesStatus =
        statusFilter === "All" || scan.safety_status.overall === statusFilter;
      if (dateRange === "All") return matchesStatus;

      const scanDate = new Date(scan.timestamp);
      const now = new Date();
      if (dateRange === "Last 7 Days") {
        return matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 7));
      }
      if (dateRange === "Last 30 Days") {
        return matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 30));
      }
      return matchesStatus;
    });

    // Map filtered scans to CSV data with additional fields
    const csvData = filteredScans.map((scan) => ({
      URL: scan.url || "N/A",
      Domain: scan.safety_status?.details?.url_info?.details?.domain || "N/A",
      Status: scan.safety_status?.overall || "Unknown",
      SecurityScore: scan.safety_status?.details?.url_info?.details?.security_score ?? "N/A",
      GeoIP:
        scan.safety_status?.details?.url_info?.checks?.find((c) => c.check === "GeoIP Location")?.status ?? "N/A",
      BlockStatus:
        scan.safety_status?.details?.url_info?.block_status === "blocked" ||
        scan.safety_status?.details?.url_info?.block_status === "already_blocked"
          ? "Blocked"
          : scan.safety_status?.details?.url_info?.block_status === "pending_user_confirmation"
          ? "Not Blocked"
          : scan.safety_status?.details?.url_info?.block_status || "Not Blocked",
      GeminiSummary: scan.gemini_summary || "No summary available",
      Timestamp: new Date(scan.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    }));

    // Generate CSV file
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });

    // Create a timestamp for the filename (e.g., 20250603_2206)
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trustlens_scans_${user.uid}_${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 ${
          isExporting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <FaDownload className="mr-2" />
            Export Data
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButton;