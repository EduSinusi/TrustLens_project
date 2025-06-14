import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import OverallScanSection from "../component/History/OverallScanResult";
import SafeScanSection from "../component/History/SafeScanSection";
import UnsafeScanSection from "../component/History/UnsafeScanSection";
import PotentiallyUnsafeScanSection from "../component/History/PotentiallyUnsafeSection";
import PersonalNotesSection from "../component/History/PersonalNotes";
import useAuth from "../firebase/useAuth";
import Lottie from "lottie-react";
import animationScanHistory from "../assets/Animation - scan history.json";

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
  const [activeTab, setActiveTab] = useState("Overall");

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
          showDetails: false,
        }));

        console.log("Scan History Data:", scans);
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

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-gray-800 text-lg font-medium">
          Checking authentication…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-gray-800 text-2xl font-medium">
          Loading Scan History...
        </p>
      </div>
    );
  }

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

  const overallScans = filteredScans;
  const safeScans = filteredScans.filter(
    (scan) => scan.safety_status.overall === "Safe" || scan.safety_status.overall === "Safe - Safe"
  );
  const unsafeScans = filteredScans.filter(
    (scan) => scan.safety_status.overall === "Unsafe"
  );
  const potentiallyUnsafeScans = filteredScans.filter(
    (scan) => scan.safety_status.overall === "Potentially Unsafe"
  );

  const toggleDetails = (scanId) => {
    setScanHistory((prev) =>
      prev.map((scan) =>
        scan.id === scanId ? { ...scan, showDetails: !scan.showDetails } : scan
      )
    );
  };

  return (
    <div className="p-8 lg:p-12 bg-sky-50 min-h-screen">
      <div className="flex items-center mb-5">
        <Lottie
          animationData={animationScanHistory}
          loop={true}
          style={{ width: 200, height: 240, marginRight: 40, speed: 0.5, marginLeft: 30 }}
        />
        <h1 className="text-7xl font-extrabold bg-gray-700 text-transparent bg-clip-text leading-tight">
          Scan History
        </h1>
      </div>

      <div className="gap-13 mb-6 flex flex-col sm:flex-row gap-4 bg-gray-200/70 backdrop-blur-md p-5 rounded-3xl shadow-lg">
        <div className="flex items-center">
          <label className="text-lg text-gray-800 font-semibold mr-4">
            Status Filter:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 hover:bg-gray-50"
          >
            <option value="All">All Statuses</option>
            <option value="Safe">Safe</option>
            <option value="Unsafe">Unsafe</option>
            <option value="Potentially Unsafe">Potentially Unsafe</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="text-lg text-gray-800 font-semibold mr-4">
            Date Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 hover:bg-gray-50"
          >
            <option value="All">All Time</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {filteredScans.length === 0 ? (
        <p className="text-gray-600 text-lg">No scan history available.</p>
      ) : (
        <>
          <div className="flex space-x-6 text-lg mb-6 border-b border-gray-200">
            <button
              className={`py-3 px-6 font-semibold transition-all duration-200 ${
                activeTab === "Overall"
                  ? "border-b-4 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("Overall")}
            >
              Overall Scan
            </button>
            <button
              className={`py-3 px-6 font-semibold transition-all duration-200 ${
                activeTab === "Safe"
                  ? "border-b-4 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("Safe")}
            >
              Safe Scans
            </button>
            <button
              className={`py-3 px-6 font-semibold transition-all duration-200 ${
                activeTab === "Unsafe"
                  ? "border-b-4 border-red-600 text-red-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("Unsafe")}
            >
              Unsafe Scans
            </button>
            <button
              className={`py-3 px-6 font-semibold transition-all duration-200 ${
                activeTab === "PotentiallyUnsafe"
                  ? "border-b-4 border-yellow-600 text-yellow-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("PotentiallyUnsafe")}
            >
              Potentially Unsafe
            </button>
            <button
              className={`py-3 px-6 font-semibold transition-all duration-200 ${
                activeTab === "PersonalNotes"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("PersonalNotes")}
            >
              Personal Notes
            </button>
          </div>

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
          {activeTab === "PersonalNotes" && (
            <PersonalNotesSection scans={filteredScans} userId={user?.uid || ""} />
          )}
        </>
      )}
    </div>
  );
};

export default ScanHistory;