import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationDashboard from "../../src/assets/Animation - dashboard.json";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase";
import SummaryStats from "../component/Dashboard/SummaryStats";
import Filters from "../component/Dashboard/Filters";
import SafetyPieChart from "../component/Dashboard/SafetyPieChart";
import VirusTotalBarChart from "../component/Dashboard/VirusTotalBarChart";
import ScanTrendsLineChart from "../component/Dashboard/ScanTrendLineChart";
import RecentScansTable from "../component/Dashboard/RecentScanTable";
import ExportButton from "../component/Dashboard/ExportButton";

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalScans: 0,
    safetyBreakdown: {
      Safe: 0,
      Unsafe: 0,
      PotentiallyUnsafe: 0,
      Nonexistent: 0,
    },
    avgSecurityScore: 0,
    blockedCount: 0,
    geoIpLocations: {},
    riskSummary: { critical: 0, high: 0, medium: 0, low: 0 },
    virusTotalStats: { malicious: 0, harmless: 0, undetected: 0 },
    recentScans: [],
    scanTrends: [],
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

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "scanned_urls"),
      (snapshot) => {
        setLoading(true);
        try {
          let scans = [];
          let safetyBreakdown = {
            Safe: 0,
            Unsafe: 0,
            PotentiallyUnsafe: 0,
            Nonexistent: 0,
          };
          let blockedCount = 0;
          let geoIpLocations = {};
          let riskSummary = { critical: 0, high: 0, medium: 0, low: 0 };
          let virusTotalStats = { malicious: 0, harmless: 0, undetected: 0 };
          let totalSecurityScore = 0;
          let scanTrends = {};

          snapshot.forEach((doc) => {
            const data = doc.data();
            const safetyStatus = data.safety_status || {};
            const urlInfo = safetyStatus.details?.url_info || {};
            const timestamp =
              data.timestamp instanceof Timestamp
                ? data.timestamp.toDate()
                : new Date(data.timestamp);
            const overall = safetyStatus.overall || "Unknown";

            if (data.url && overall && timestamp) {
              scans.push({ ...data, id: doc.id, timestamp });
              if (overall === "Safe") safetyBreakdown.Safe++;
              else if (overall === "Unsafe") safetyBreakdown.Unsafe++;
              else if (overall === "Potentially Unsafe")
                safetyBreakdown.PotentiallyUnsafe++;
              else if (overall === "URL does not exist")
                safetyBreakdown.Nonexistent++;
              if (data.blocked) blockedCount++;
              const geoIpCheck = urlInfo.checks?.find(
                (c) => c.check === "GeoIP Location"
              );
              const geoIp = geoIpCheck ? geoIpCheck.status : "Unknown";
              geoIpLocations[geoIp] = (geoIpLocations[geoIp] || 0) + 1;
              if (urlInfo.risk_summary) {
                riskSummary.critical += urlInfo.risk_summary.critical || 0;
                riskSummary.high += urlInfo.risk_summary.high || 0;
                riskSummary.medium += urlInfo.risk_summary.medium || 0;
                riskSummary.low += urlInfo.risk_summary.low || 0;
              }
              if (safetyStatus.details?.virustotal?.stats) {
                virusTotalStats.malicious +=
                  safetyStatus.details.virustotal.stats.malicious || 0;
                virusTotalStats.harmless +=
                  safetyStatus.details.virustotal.stats.harmless || 0;
                virusTotalStats.undetected +=
                  safetyStatus.details.virustotal.stats.undetected || 0;
              }
              totalSecurityScore += urlInfo.security_score || 0;
              const date = timestamp.toISOString().split("T")[0];
              scanTrends[date] = (scanTrends[date] || 0) + 1;
            }
          });

          const processedData = {
            totalScans: scans.length,
            safetyBreakdown,
            avgSecurityScore: scans.length
              ? totalSecurityScore / scans.length
              : 0,
            blockedCount,
            geoIpLocations,
            riskSummary,
            virusTotalStats,
            recentScans: scans
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 10),
            scanTrends: Object.entries(scanTrends).map(([date, count]) => ({
              date,
              count,
            })),
          };

          setAnalyticsData(processedData);
        } catch (error) {
          console.error("Error fetching analytics:", error);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Snapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 font-sans tracking-tight">
          Please Log In
        </h1>
        <p className="text-gray-600 text-lg">
          You need to be logged in to view your analytics dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 animate-pulse">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 font-sans tracking-tight">
          Loading Analytics...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-start p-8 lg:p-12">
      <div className="w-full max-w-7xl">
        <div className="flex items-center mb-5">
          <Lottie
            animationData={animationDashboard}
            loop={true}
            style={{ width: 300, height: 240, marginRight: 40 }}
          />
          <h1 className="text-7xl font-extrabold bg-gray-700 text-transparent bg-clip-text leading-tight">
            TrustLens Analytics
          </h1>
        </div>

        <SummaryStats analyticsData={analyticsData} />
        <Filters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <SafetyPieChart safetyBreakdown={analyticsData.safetyBreakdown} />
          <VirusTotalBarChart virusTotalStats={analyticsData.virusTotalStats} />
          <ScanTrendsLineChart
            scanTrends={analyticsData.scanTrends}
            className="col-span-1 lg:col-span-2"
          />
        </div>
        <RecentScansTable
          recentScans={analyticsData.recentScans}
          statusFilter={statusFilter}
          dateRange={dateRange}
          setAnalyticsData={setAnalyticsData}
        />
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
