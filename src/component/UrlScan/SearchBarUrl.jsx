import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UrlAnalysis from "./Components/UrlAnalysis";
import { FaUpload, FaCircleNotch } from "react-icons/fa";
import useAuth from "../../firebase/useAuth";

const UrlSearchBar = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navMenuRef = useRef(null);
  const { user, fetchWithAuth, error: authError } = useAuth();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setIsNavMenuOpen(false);
      }
    };

    if (isNavMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNavMenuOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    if (!url || !url.match(/^https?:\/\/.+/)) {
      setError("Please enter a valid URL starting with http:// or https://");
      setLoading(false);
      return;
    }

    try {
      const idToken = user ? await user.getIdToken() : null;
      const response = await fetchWithAuth("http://localhost:8000/scan_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify({ url }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setResult({
          url: data.url,
          safetyStatus: data.safety_status,
          blockStatus: data.block_status,
          gemini_summary: data.gemini_summary,
        });
      } else {
        setError(data.detail || "An error occurred while checking the URL.");
      }
    } catch (err) {
      setError(authError || "Failed to connect to the backend.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnalysis = () => {
    setIsAnalysisOpen(!isAnalysisOpen);
  };

  const toggleNavMenu = (e) => {
    e.stopPropagation();
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const navigateToImageScan = () => {
    navigate("/url-scan/image");
    setIsNavMenuOpen(false);
  };

  const navigateToLiveScan = () => {
    navigate("/url-scan/webcam");
    setIsNavMenuOpen(false);
  };

  return (
    <div className="p-10 flex flex-col items-center">
      <div className="flex items-center mb-5">
        <div className="relative" ref={navMenuRef}>
          <button
            onClick={toggleNavMenu}
            className="flex items-center px-2 py-1 rounded-md hover:bg-gray-300 transition-all"
          >
            <h1 className="text-3xl font-bold ml-2 text-gray-800">
              TrustLens Safe Search
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ml-3 transition-transform duration-300 ${
                isNavMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          {isNavMenuOpen && (
            <div className="absolute top-13 left-70 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700 z-50 w-48">
              <button
                onClick={navigateToImageScan}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700"
              >
                Image Scan
              </button>
              <button
                onClick={navigateToLiveScan}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700"
              >
                Live Scan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg shadow-lg p-6 w-full max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="url"
              className="block text-md font-medium text-gray-900"
            >
              Enter URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 px-2 bg-gradient-to-t from-blue-600 to-blue-400 text-white rounded-md w-full  flex items-center justify-center shadow-md hover:from-blue-500 hover:to-blue-400 transition-all duration-300 text-md ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "flex items-center justify-center bg-gradient-to-t from-blue-600 to-blue-400 hover:bg-sky-800"
            } transition-colors`}
          >
            {loading ? (
              <FaCircleNotch className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <FaUpload className="h-5 w-5 mr-2" />
            )}
            {loading ? "Scanning..." : "Scan URL"}
          </button>
        </form>
      </div>
      <div className="w-[900px] mt-3">
        {result && (
          <div className="mt-6 space-y-4">
            <UrlAnalysis
              extractedUrl={result.url}
              safetyStatus={result.safetyStatus}
              gemini_summary={result.gemini_summary}
              isAnalysisOpen={isAnalysisOpen}
              toggleAnalysis={toggleAnalysis}
              loading={loading}
              userId={user?.uid || ""}
            />
          </div>
        )}

        {(error || authError) && (
          <div className="mt-6 p-4 rounded-md bg-red-100 border border-red-200 text-red-700">
            <h2 className="font-semibold">Error</h2>
            <p>{error || authError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlSearchBar;