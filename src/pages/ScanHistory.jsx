// File: src/pages/ScanHistory.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase"; // Adjust to your actual Firebase path
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import OverallScanSection from "../component/History/OverallScanResult";
import SafeScanSection from "../component/History/SafeScanSection";
import UnsafeScanSection from "../component/History/UnsafeScanSection";
import PotentiallyUnsafeScanSection from "../component/History/PotentiallyUnsafeSection";
import useAuth from "../firebase/useAuth";

const ScanHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const [scanHistory, setScanHistory] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);
  const [isVirusTotalPopupOpen, setIsVirusTotalPopupOpen] = useState(false);
  const [isSecurityPopupOpen, setIsSecurityPopupOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState("All");
  const [activeTab, setActiveTab] = useState("Overall"); // State to manage active tab

  // 1) Fetch scan history from Firestore once user is known
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("Please log in to view your scan history.");
      setLoadingData(false);
      return;
    }

    const fetchScanHistory = async () => {
      setLoadingData(true);
      setError("");

      try {
        const scansRef = collection(db, "users", user.uid, "scanned_urls");
        const q = query(scansRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const scans = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          showDetails: false, // for expanding/collapsing rows
        }));

        setScanHistory(scans);
      } catch (err) {
        console.error("Error fetching scan history:", err);
        setError(`Failed to fetch scan history: ${err.message}`);
      } finally {
        setLoadingData(false);
      }
    };

    fetchScanHistory();
  }, [authLoading, user]);

  // 2) Show “Checking authentication…” spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-2 text-gray-700">Checking authentication…</p>
      </div>
    );
  }

  // 3) If there was an explicit error (not logged in or Firestore error), show it
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // 4) If user is logged in but data is still loading, show loading spinner
  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-2 text-gray-700">Loading scan history...</p>
      </div>
    );
  }

  // 5) Filter scans based on statusFilter and dateRange
  const filteredScans = scanHistory.filter((scan) => {
    const matchesStatus =
      statusFilter === "All" || scan.safety_status.overall === statusFilter;

    if (dateRange === "All") {
      return matchesStatus;
    }

    const scanDate = scan.timestamp;
    const now = new Date();

    if (dateRange === "Last 7 Days") {
      return matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 7));
    }

    if (dateRange === "Last 30 Days") {
      return matchesStatus && scanDate >= new Date(now.setDate(now.getDate() - 30));
    }

    return matchesStatus;
  });

  // 6) Categorize scans
  const overallScans = filteredScans;
  const safeScans = filteredScans.filter((scan) => scan.safety_status.overall === "Safe");
  const unsafeScans = filteredScans.filter((scan) => scan.safety_status.overall === "Unsafe");
  const potentiallyUnsafeScans = filteredScans.filter((scan) => scan.safety_status.overall === "Potentially Unsafe");

  // 7) Toggle details handler
  const toggleDetails = (scanId) => {
    setScanHistory((prev) =>
      prev.map((scan) =>
        scan.id === scanId ? { ...scan, showDetails: !scan.showDetails } : scan
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Scan History</h1>

      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All">All Statuses</option>
          <option value="Safe">Safe</option>
          <option value="Unsafe">Unsafe</option>
          <option value="Potentially Unsafe">Potentially Unsafe</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All">All Time</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
        </select>
      </div>

      {filteredScans.length === 0 ? (
        <p className="text-gray-600">No scan history available.</p>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-4 text-xl mb-4 border-b border-gray-300">
            <button
              className={`py-2 px-4 font-semibold ${activeTab === "Overall" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("Overall")}
            >
              Overall Scan
            </button>
            <button
              className={`py-2 px-4 font-semibold ${activeTab === "Safe" ? "border-b-2 border-green-600 text-green-600" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("Safe")}
            >
              Safe Scan Results
            </button>
            <button
              className={`py-2 px-4 font-semibold ${activeTab === "Unsafe" ? "border-b-2 border-red-600 text-red-600" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("Unsafe")}
            >
              Unsafe Scan Results
            </button>
            <button
              className={`py-2 px-4 font-semibold ${activeTab === "PotentiallyUnsafe" ? "border-b-2 border-yellow-600 text-yellow-600" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab("PotentiallyUnsafe")}
            >
              Potentially Unsafe Scan Results
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "Overall" && (
            <OverallScanSection
              scans={overallScans}
              selectedScan={selectedScan}
              setSelectedScan={setSelectedScan}
              isVirusTotalPopupOpen={isVirusTotalPopupOpen}
              setIsVirusTotalPopupOpen={setIsVirusTotalPopupOpen}
              isSecurityPopupOpen={isSecurityPopupOpen}
              setIsSecurityPopupOpen={setIsSecurityPopupOpen}
              toggleDetails={toggleDetails}
            />
          )}
          {activeTab === "Safe" && (
            <SafeScanSection
              scans={safeScans}
              selectedScan={selectedScan}
              setSelectedScan={setSelectedScan}
              isVirusTotalPopupOpen={isVirusTotalPopupOpen}
              setIsVirusTotalPopupOpen={setIsVirusTotalPopupOpen}
              isSecurityPopupOpen={isSecurityPopupOpen}
              setIsSecurityPopupOpen={setIsSecurityPopupOpen}
            />
          )}
          {activeTab === "Unsafe" && (
            <UnsafeScanSection
              scans={unsafeScans}
              selectedScan={selectedScan}
              setSelectedScan={setSelectedScan}
              isVirusTotalPopupOpen={isVirusTotalPopupOpen}
              setIsVirusTotalPopupOpen={setIsVirusTotalPopupOpen}
              isSecurityPopupOpen={isSecurityPopupOpen}
              setIsSecurityPopupOpen={setIsSecurityPopupOpen}
            />
          )}
          {activeTab === "PotentiallyUnsafe" && (
            <PotentiallyUnsafeScanSection
              scans={potentiallyUnsafeScans}
              selectedScan={selectedScan}
              setSelectedScan={setSelectedScan}
              isVirusTotalPopupOpen={isVirusTotalPopupOpen}
              setIsVirusTotalPopupOpen={setIsVirusTotalPopupOpen}
              isSecurityPopupOpen={isSecurityPopupOpen}
              setIsSecurityPopupOpen={setIsSecurityPopupOpen}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ScanHistory;