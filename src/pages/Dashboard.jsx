// Dashboard.jsx
import React, { useState, useEffect } from "react";
import { FaChartPie } from "react-icons/fa";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase";
import InfoBubble from "../component/UrlScan/Components/InfoBubble";
import SummaryStats from "../component/Dashboard/SummaryStats";
import Filters from "../component/Dashboard/Filters"; 
import SafetyPieChart from "../component/Dashboard/SafetyPieChart";
import VirusTotalBarChart from "../component/Dashboard/VirusTotalBarChart";
import ScanTrendsLineChart from "../component/Dashboard/ScanTrendLineChart";
import TopRiskyChecks from "../component/Dashboard/TopRiskyChecks";
import RecentScansTable from "../component/Dashboard/RecentScanTable";
import BlockedUrlsTable from "../component/Dashboard/BlockedUrlsTable";
import ExportButton from "../component/Dashboard/ExportButton";

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
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("All");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const scansRef = collection(db, "users", user.uid, "scanned_urls");
        const scansSnapshot = await getDocs(scansRef);
        const blockedRef = collection(db, "users", user.uid, "blocked_list");
        const blockedSnapshot = await getDocs(blockedRef);

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

        scansSnapshot.forEach((doc) => {
          const data = doc.data();
          const safetyStatus = data.safety_status || {};
          const urlInfo = safetyStatus.details?.url_info || {};
          const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp);
          const overall = safetyStatus.overall || "Unknown";

          if (data.url && overall && timestamp) {
            scans.push({ ...data, id: doc.id, timestamp });
            if (overall === "Safe") safetyBreakdown.Safe++;
            else if (overall === "Unsafe") safetyBreakdown.Unsafe++;
            else if (overall === "Potentially Unsafe") safetyBreakdown.PotentiallyUnsafe++;
            else if (overall === "URL does not exist") safetyBreakdown.Nonexistent++;
            if (data.blocked) blockedCount++;
            const geoIp = urlInfo.checks?.find((c) => c.check === "GeoIP Location")?.status || "Unknown";
            geoIpLocations[geoIp] = (geoIpLocations[geoIp] || 0) + 1;
            if (urlInfo.risk_summary) {
              riskSummary.critical += urlInfo.risk_summary.critical || 0;
              riskSummary.high += urlInfo.risk_summary.high || 0;
              riskSummary.medium += urlInfo.risk_summary.medium || 0;
              riskSummary.low += urlInfo.risk_summary.low || 0;
            }
            if (safetyStatus.details?.virustotal?.stats) {
              virusTotalStats.malicious += safetyStatus.details.virustotal.stats.malicious || 0;
              virusTotalStats.harmless += safetyStatus.details.virustotal.stats.harmless || 0;
              virusTotalStats.undetected += safetyStatus.details.virustotal.stats.undetected || 0;
            }
            totalSecurityScore += urlInfo.security_score || 0;
            const date = timestamp.toISOString().split("T")[0];
            scanTrends[date] = (scanTrends[date] || 0) + 1;
            urlInfo.checks?.forEach((check) => {
              if (check.risk === "high" || check.risk === "critical") {
                topRiskyChecks[check.check] = (topRiskyChecks[check.check] || 0) + 1;
              }
            });
          }
        });

        blockedSnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp);
          blockedUrls.push({
            url: data.url,
            status: data.safety_status?.overall || "Unknown",
            timestamp: timestamp,
            reason: data.reason || "URL deemed unsafe",
          });
        });

        blockedCount = blockedSnapshot.size;

        const processedData = {
          totalScans: scans.length,
          safetyBreakdown,
          avgSecurityScore: scans.length ? totalSecurityScore / scans.length : 0,
          blockedCount,
          geoIpLocations,
          riskSummary,
          virusTotalStats,
          recentScans: scans.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10),
          scanTrends: Object.entries(scanTrends).map(([date, count]) => ({ date, count })),
          blockedUrls,
          topRiskyChecks: Object.entries(topRiskyChecks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([check, count]) => ({ check, count })),
        };

        setAnalyticsData(processedData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
        <p className="text-gray-600">You need to be logged in to view your analytics dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading Analytics...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <FaChartPie className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">TrustLens Analytics</h1>
          <InfoBubble apiName="Analytics Dashboard" />
        </div>

        <SummaryStats analyticsData={analyticsData} />
        <Filters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SafetyPieChart safetyBreakdown={analyticsData.safetyBreakdown} />
          <VirusTotalBarChart virusTotalStats={analyticsData.virusTotalStats} />
          <ScanTrendsLineChart
            scanTrends={analyticsData.scanTrends}
            className="col-span-1 lg:col-span-2"
          />
        </div>
        <TopRiskyChecks topRiskyChecks={analyticsData.topRiskyChecks} />
        <RecentScansTable
          recentScans={analyticsData.recentScans}
          statusFilter={statusFilter}
          dateRange={dateRange}
          setAnalyticsData={setAnalyticsData}
        />
        <BlockedUrlsTable blockedUrls={analyticsData.blockedUrls} />
        <ExportButton
          recentScans={analyticsData.recentScans}
          statusFilter={statusFilter}
          dateRange={dateRange}
          user={user}
        />
      </div>
    </div>
  );
};

export default Dashboard;