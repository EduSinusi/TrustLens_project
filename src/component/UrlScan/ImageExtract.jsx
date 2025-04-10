import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UrlResult from "./Components/UrlResult"; // Import UrlResult component
import UrlAnalysis from "./Components/UrlAnalysis"; // Import UrlAnalysis component

const ImageExtract = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedUrl, setExtractedUrl] = useState("");
  const [safetyStatus, setSafetyStatus] = useState({
    overall: "",
    details: {},
  });
  const [blockStatus, setBlockStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const navMenuRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close the dropdown
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

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://localhost:8000/scan_image", {
        method: "POST",
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
        if (!data.url) {
          setMessage("No URL detected in the image.");
        }
      } else {
        setError(data.detail || "Failed to process the image.");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
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
    setError("");
    setMessage("");
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-start p-15">
      <div className="relative flex items-center justify-center w-full max-w-4xl">
        <div ref={navMenuRef}>
          <button
            onClick={toggleNavMenu}
            className="flex items-center px-2 py-1 rounded-md hover:bg-gray-300 transition-all"
          >
            <h1 className="text-3xl font-bold ml-2 text-gray-800">
              TrustLens Image Scan
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
            <div className="absolute top-13 left-146 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700 z-50 w-48">
              <button
                onClick={() => {
                  navigate("/url-scan/search");
                  setIsNavMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700"
              >
                URL Search
              </button>
              <button
                onClick={() => {
                  navigate("/url-scan/image");
                  setIsNavMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700"
              >
                Image Scan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-5">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-md font-bold mb-2"
              htmlFor="image-upload"
            >
              Upload an Image to Scan for URLs
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {preview && (
            <div className="mb-4 items-center justify-center flex-col flex">
              <h2 className="text-lg font-bold mb-5">Image Preview</h2>
              <img
                src={preview}
                alt="Preview"
                className="w-[50%] h-auto rounded-lg"
              />
            </div>
          )}
          <div className="mb-4 mt-5">
            <button
              onClick={handleImageUpload}
              disabled={loading || !image}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2 ${
                loading || !image ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Scan Image"}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className={`bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Reset
            </button>
          </div>
          {error && (
            <div className="mt-2 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded-lg">
              <p>{message}</p>
            </div>
          )}
        </div>
        {extractedUrl && (
          <>
            <UrlResult
              extractedUrl={extractedUrl}
              safetyStatus={safetyStatus}
            />
            <UrlAnalysis
              extractedUrl={extractedUrl}
              safetyStatus={safetyStatus}
              isAnalysisOpen={isAnalysisOpen}
              toggleAnalysis={toggleAnalysis}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageExtract;
