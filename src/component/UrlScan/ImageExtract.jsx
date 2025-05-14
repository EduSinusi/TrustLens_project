import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UrlResult from "./Components/UrlResult";
import UrlAnalysis from "./Components/UrlAnalysis";
import { FaUpload, FaRedo, FaCircleNotch } from "react-icons/fa";
import useAuth from "../../firebase/useAuth";

const ImageExtract = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedUrl, setExtractedUrl] = useState("");
  const [safetyStatus, setSafetyStatus] = useState({
    overall: "",
    details: {},
  });
  const [blockStatus, setBlockStatus] = useState(null);
  const [geminiSummary, setGeminiSummary] = useState(""); // Added to store Gemini summary
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, fetchWithAuth, error: authError } = useAuth();

  useEffect(() => {
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

  const toggleNavMenu = () => {
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const toggleAnalysis = () => {
    setIsAnalysisOpen(!isAnalysisOpen);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setExtractedUrl("");
      setSafetyStatus({ overall: "", details: {} });
      setBlockStatus(null);
      setGeminiSummary(""); // Reset Gemini summary
      setError("");
      setMessage("");
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      setError("Please select an image to scan.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const idToken = user ? await user.getIdToken() : null;
      const formData = new FormData();
      formData.append("file", image);
      const response = await fetchWithAuth("http://localhost:8000/scan_image", {
        method: "POST",
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setExtractedUrl(data.url || "");
        setSafetyStatus(
          data.safety_status || {
            overall: "No safety status available",
            details: {},
          }
        );
        setBlockStatus(data.block_status || null);
        setGeminiSummary(data.gemini_summary || "No summary available"); // Store Gemini summary
        if (!data.url) {
          setMessage("No URL detected in the image.");
        }
      } else {
        setError(data.detail || "Failed to process the image.");
      }
    } catch (err) {
      setError(authError || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setExtractedUrl("");
    setSafetyStatus({ overall: "", details: {} });
    setBlockStatus(null);
    setGeminiSummary(""); // Reset Gemini summary
    setError("");
    setMessage("");
  };

  return (
    <div className="max-h-screen">
      <div className="flex items-start justify-start mb-8 ml-24 mt-5">
        <div className="relative" ref={navMenuRef}>
          <button
            onClick={toggleNavMenu}
            className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 transition-all duration-300"
          >
            <h1 className="text-3xl font-bold text-gray-800">
              TrustLens Image Scan
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ml-3 text-gray-600 transition-transform duration-300 ${
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
            <div className="absolute top-13 left-78 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700 z-50 w-48">
              <button
                onClick={() => {
                  navigate("/url-scan/search");
                  setIsNavMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700 transition-all duration-200"
              >
                URL Search
              </button>
              <button
                onClick={() => {
                  navigate("/url-scan/webcam");
                  setIsNavMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700 transition-all duration-200"
              >
                Live Scan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-20 items-start max-w-[1500px] mx-auto pb-10">
        <div className="w-1/2 rounded-lg shadow-lg p-5">
          <div className="mb-6">
            <label
              className="block text-gray-800 text-xl ml-2 font-bold mb-5"
              htmlFor="image-upload"
            >
              UPLOAD IMAGE
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full mb-9 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 transition-all duration-200"
            />
          </div>

          {preview && (
            <div className="mb-10 flex flex-col items-center">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Image Preview
              </h2>
              <img
                src={preview}
                alt="Preview"
                className="w-[50%] h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          {extractedUrl && (
            <div className="justify-start mt-1 pb-6 max-w-[850px] mx-auto">
              <div className="p-2">
                <UrlResult
                  extractedUrl={extractedUrl}
                  safetyStatus={safetyStatus}
                />
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={handleImageUpload}
              disabled={loading || !image}
              className={`flex-1 bg-gradient-to-t from-blue-600 to-blue-400 text-white rounded-md py-2 px-4 flex items-center justify-center shadow-md hover:from-blue-500 hover:to-blue-400 transition-all duration-300 ${
                loading || !image ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <FaCircleNotch className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <FaUpload className="h-5 w-5 mr-2" />
              )}
              {loading ? "Scanning..." : "Scan Image"}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className={`flex-1 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-md py-2 px-4 flex items-center justify-center shadow-md hover:from-gray-500 hover:to-gray-400 transition-all duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <FaRedo className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>

          {(error || authError) && (
            <div className="mt-4 px-3 py-2 rounded-md bg-gradient-to-r from-red-100 to-red-50 border border-red-200 text-red-700 shadow-md">
              <h2 className="font-semibold">Error</h2>
              <p>{error || authError}</p>
            </div>
          )}
          {message && (
            <div className="mt-4 px-3 py-2 rounded-md bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 text-yellow-700 shadow-md">
              <h2 className="font-semibold">Notification</h2>
              <p>{message}</p>
            </div>
          )}
        </div>

        <div className="w-1/2">
          <UrlAnalysis
            extractedUrl={extractedUrl}
            gemini_summary={geminiSummary} // Pass the stored Gemini summary
            safetyStatus={safetyStatus}
            isAnalysisOpen={isAnalysisOpen}
            toggleAnalysis={toggleAnalysis}
            isLoading={loading}
            userId={user?.uid || ""}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes heartbeat {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-heartbeat {
          animation: heartbeat 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default ImageExtract;