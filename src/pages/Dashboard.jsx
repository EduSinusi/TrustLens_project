import React, { useState, useEffect } from "react";
import { FaChartPie, FaShieldAlt, FaGlobe, FaDownload, FaExclamationTriangle } from "react-icons/fa";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase"; // Adjust path
import InfoBubble from "../component/UrlScan/Components/InfoBubble";
import Papa from "papaparse";

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalScans: 0,
    safetyBreakdown: { Safe: 0, Unsafe: 0, PotentiallyUnsafe: 0, Nonexistent: 0 },
    avgSecurityScore: 0,
    blockedCount: 0,
    geoIpLocations: {},
    riskSummary: { critical: 0, high: 0, medium: 0, low: 0 },
    virusTotalStats: { malicious: 0, harmless: 0, undetected: 0 },
    recentScans: [],
    scanTrends: [],
    blockedUrls: [],
    topRiskyChecks: [],
  });
  const [loading, setLoading] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isBlockedTableOpen, setIsBlockedTableOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("All");
  const [user, setUser] = useState(null);

  // Monitor auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch data from Firebase
  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch user-specific scans
        const scansQuery = query(
          collection(db, "Scanned URLs"),
          where("uid", "==", user.uid)
        );
        const scansSnapshot = await getDocs(scansQuery);

        // Fetch user-specific blocked URLs
        const blockedQuery = query(
          collection(db, "Blocked Websites"),
          where("uid", "==", user.uid)
        );
        const blockedSnapshot = await getDocs(blockedQuery);

        let scans = [];
        let safetyBreakdown = { Safe: 0, Unsafe: 0, PotentiallyUnsafe: 0, Nonexistent: 0 };
        let blockedCount = 0;
        let geoIpLocations = {};
        let riskSummary = { critical: 0, high: 0, medium: 0, low: 0 };
        let virusTotalStats = { malicious: 0, harmless: 0, undetected: 0 };
        let totalSecurityScore = 0;
        let scanTrends = {};
        let topRiskyChecks = {};
        let blockedUrls = [];

        // Process scans
        scansSnapshot.forEach((doc) => {
          const data = doc.data();
          const safetyStatus = data.safety_status || {};
          const urlInfo = safetyStatus.details?.url_info || {};
          // Ensure sufficient data
          if (
            data.url &&
            safetyStatus.overall &&
            urlInfo.security_score != null &&
            data.timestamp &&
            urlInfo.checks?.length > 0 &&
            safetyStatus.details?.virustotal?.stats
          ) {
            scans.push({ ...data, id: doc.id });
            // Safety Breakdown
            const status = safetyStatus.overall;
            if (status === "Safe") safetyBreakdown.Safe++;
            else if (status === "Unsafe") safetyBreakdown.Unsafe++;
            else if (status === "Potentially Unsafe") safetyBreakdown.PotentiallyUnsafe++;
            else if (status === "URL does not exist") safetyBreakdown.Nonexistent++;
            // Blocked Count
            if (urlInfo.block_status === "already_blocked") blockedCount++;
            // GeoIP Locations
            const geoIp = urlInfo.checks.find((c) => c.check === "GeoIP Location")?.status || "Unknown";
            geoIpLocations[geoIp] = (geoIpLocations[geoIp] || 0) + 1;
            // Risk Summary
            if (urlInfo.risk_summary) {
              riskSummary.critical += urlInfo.risk_summary.critical || 0;
              riskSummary.high += urlInfo.risk_summary.high || 0;
              riskSummary.medium += urlInfo.risk_summary.medium || 0;
              riskSummary.low += urlInfo.risk_summary.low || 0;
            }
            // VirusTotal Stats
            if (safetyStatus.details?.virustotal?.stats) {
              virusTotalStats.malicious += safetyStatus.details.virustotal.stats.malicious || 0;
              virusTotalStats.harmless += safetyStatus.details.virustotal.stats.harmless || 0;
              virusTotalStats.undetected += safetyStatus.details.virustotal.stats.undetected || 0;
            }
            // Security Score
            totalSecurityScore += urlInfo.security_score || 0;
            // Scan Trends
            const date = new Date(data.timestamp.toDate()).toISOString().split("T")[0];
            scanTrends[date] = (scanTrends[date] || 0) + 1;
            // Top Risky Checks
            urlInfo.checks.forEach((check) => {
              if (check.risk === "high" || check.risk === "critical") {
                topRiskyChecks[check.check] = (topRiskyChecks[check.check] || 0) + 1;
              }
            });
          }
        });

        // Process blocked URLs
        blockedSnapshot.forEach((doc) => {
          const data = doc.data();
          blockedUrls.push({
            url: data.url,
            status: data.safety_status?.overall || "Unknown",
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });

        setAnalyticsData({
          totalScans: scans.length,
          safetyBreakdown,
          avgSecurityScore: scans.length ? totalSecurityScore / scans.length : 0,
          blockedCount,
          geoIpLocations,
          riskSummary,
          virusTotalStats,
          recentScans: scans
            .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
            .slice(0, 10),
          scanTrends: Object.entries(scanTrends).map(([date, count]) => ({ date, count })),
          blockedUrls,
          topRiskyChecks: Object.entries(topRiskyChecks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([check, count]) => ({ check, count })),
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  // Pie chart data for safety breakdown
  const safetyPieData = [
    { name: "Safe", value: analyticsData.safetyBreakdown.Safe },
    { name: "Unsafe", value: analyticsData.safetyBreakdown.Unsafe },
    { name: "Potentially Unsafe", value: analyticsData.safetyBreakdown.PotentiallyUnsafe },
    { name: "Non-existent", value: analyticsData.safetyBreakdown.Nonexistent },
  ];
  const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6B7280"];

  // Bar chart data for VirusTotal stats
  const vtBarData = [
    { name: "Malicious", count: analyticsData.virusTotalStats.malicious },
    { name: "Harmless", count: analyticsData.virusTotalStats.harmless },
    { name: "Undetected", count: analyticsData.virusTotalStats.undetected },
  ];

  // Filter scans by status and date range
  const filteredScans = analyticsData.recentScans.filter((scan) => {
    const matchesStatus = statusFilter === "All" || scan.safety_status.overall === statusFilter;
    if (dateRange === "All") return matchesStatus;
    const scanDate = new Date(scan.timestamp.toDate());
    const now = new Date();
    if (dateRange === "Last 7 Days") {
      return matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 7));
    }
    if (dateRange === "Last 30 Days") {
      return matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 30));
    }
    return matchesStatus;
  });

  // Export CSV
  const handleExport = () => {
    const csvData = filteredScans.map((scan) => ({
      URL: scan.url,
      Status: scan.safety_status.overall,
      SecurityScore: scan.safety_status.details?.url_info?.security_score ?? "N/A",
      GeoIP: scan.safety_status.details?.url_info?.checks?.find((c) => c.check === "GeoIP Location")?.status ?? "N/A",
      Timestamp: scan.timestamp.toDate().toLocaleString(),
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

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
        <p className="text-gray-600">You need to be logged in to view your analytics dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <FaChartPie className="h-6 w-6 text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">TrustLens Analytics</h1>
          <InfoBubble apiName="Analytics Dashboard" />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <div className="flex items-center">
              <FaShieldAlt className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-700">Total Scans</h2>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {loading ? "..." : analyticsData.totalScans}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700">Blocked URLs</h2>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {loading ? "..." : analyticsData.blockedCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700">Avg. Security Score</h2>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {loading ? "..." : Math.round(analyticsData.avgSecurityScore)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <div className="flex items-center">
              <FaGlobe className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-700">Top GeoIP Location</h2>
            </div>
            <p className="text-xl font-bold text-gray-800 mt-2 truncate">
              {loading
                ? "..."
                : Object.entries(analyticsData.geoIpLocations).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div>
            <label className="text-gray-700 font-semibold mr-2">Status Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Unsafe">Unsafe</option>
              <option value="Potentially Unsafe">Potentially Unsafe</option>
              <option value="URL does not exist">Non-existent</option>
            </select>
          </div>
          <div>
            <label className="text-gray-700 font-semibold mr-2">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="All">All Time</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Safety Status Distribution</h2>
            {loading ? (
              <p className="text-gray-600">Loading chart...</p>
            ) : (
              <PieChart width={300} height={200}>
                <Pie
                  data={safetyPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {safetyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">VirusTotal Detections</h2>
            {loading ? (
              <p className="text-gray-600">Loading chart...</p>
            ) : (
              <BarChart width={300} height={200} data={vtBarData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Scan Frequency Over Time</h2>
            {loading ? (
              <p className="text-gray-600">Loading chart...</p>
            ) : (
              <LineChart width={600} height={200} data={analyticsData.scanTrends}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" />
              </LineChart>
            )}
          </div>
        </div>

        {/* Top Risky Checks */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-700">Top Risky Checks</h2>
          </div>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : analyticsData.topRiskyChecks.length > 0 ? (
            <ul className="list-disc list-inside text-sm">
              {analyticsData.topRiskyChecks.map((item, index) => (
                <li key={index}>
                  {item.check}: Detected {item.count} times
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No high or critical risks detected.</p>
          )}
        </div>

        {/* Recent Scans Table */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Scans</h2>
            <button
              onClick={() => setIsTableOpen(!isTableOpen)}
              className="text-blue-600 hover:underline flex items-center"
            >
              {isTableOpen ? "Hide Details" : "Show Details"}
            </button>
          </div>
          {isTableOpen && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Security Score</th>
                  <th className="py-3 px-4">GeoIP Location</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan, index) => (
                  <React.Fragment key={scan.id}>
                    <tr className="border-t border-gray-200">
                      <td className="py-3 px-4">{scan.safety_status.details?.url_info?.domain || scan.url}</td>
                      <td
                        className={`py-3 px-4 ${
                          scan.safety_status.overall === "Safe"
                            ? "text-green-600"
                            : scan.safety_status.overall === "Unsafe"
                            ? "text-red-600"
                            : scan.safety_status.overall === "Potentially Unsafe"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {scan.safety_status.overall}
                      </td>
                      <td className="py-3 px-4">
                        {scan.safety_status.details?.url_info?.security_score ?? "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {scan.safety_status.details?.url_info?.checks?.find(
                          (c) => c.check === "GeoIP Location"
                        )?.status || "N/A"}
                      </td>
                      <td className="py-3 px-4">{scan.timestamp.toDate().toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            setAnalyticsData((prev) => ({
                              ...prev,
                              recentScans: prev.recentScans.map((s) =>
                                s.id === scan.id ? { ...s, showDetails: !s.showDetails } : s
                              ),
                            }))
                          }
                          className="text-blue-600 hover:underline"
                        >
                          {scan.showDetails ? "Hide" : "Show"}
                        </button>
                      </td>
                    </tr>
                    {scan.showDetails && (
                      <tr>
                        <td colSpan={6} className="py-3 px-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold">Checks</h4>
                              <ul className="list-disc list-inside text-sm">
                                {scan.safety_status.details?.url_info?.checks?.map((check, i) => (
                                  <li key={i}>
                                    {check.check}: {check.status} ({check.risk})
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold">VirusTotal Engines</h4>
                              <ul className="list-disc list-inside text-sm">
                                {Object.entries(
                                  scan.safety_status.details?.virustotal?.scan_results || {}
                                ).map(
                                  ([engine, result]) =>
                                    result.category === "malicious" && (
                                      <li key={engine}>
                                        {engine}: {result.result}
                                      </li>
                                    )
                                )}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Blocked URLs Table */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Blocked URLs</h2>
            <button
              onClick={() => setIsBlockedTableOpen(!isBlockedTableOpen)}
              className="text-blue-600 hover:underline flex items-center"
            >
              {isBlockedTableOpen ? "Hide Details" : "Show Details"}
            </button>
          </div>
          {isBlockedTableOpen && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                  <th className="py-3 px-4">URL</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Blocked On</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.blockedUrls.map((url, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-3 px-4">{url.url}</td>
                    <td
                      className={`py-3 px-4 ${
                        url.status === "Safe"
                          ? "text-green-600"
                          : url.status === "Unsafe"
                          ? "text-red-600"
                          : url.status === "Potentially Unsafe"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    >
                      {url.status}
                    </td>
                    <td className="py-3 px-4">{url.timestamp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <FaDownload className="mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;