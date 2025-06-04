// src/component/UrlScan/WebcamScan.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UrlAnalysis from "./Components/UrlAnalysis";
import UrlResult from "./Components/UrlResult";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { FaCirclePlay, FaCirclePause } from "react-icons/fa6";
import { PiPictureInPicture } from "react-icons/pi";
import useAuth from "../../firebase/useAuth";

const WebcamScan = () => {
  const [webcamError, setWebcamError] = useState("");
  const [cameraIndex, setCameraIndex] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [webcamOn, setWebcamOn] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState("");
  const [safetyStatus, setSafetyStatus] = useState({
    overall: "",
    details: {},
  });
  const [geminiSummary, setGeminiSummary] = useState(""); // Added to store Gemini summary
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const navigate = useNavigate();
  const navMenuRef = useRef(null);
  const pipWindowRef = useRef(null);
  const { user, fetchWithAuth, error: authError } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkWebcamStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/get_webcam_status");
        const data = await response.json();
        setWebcamError(data.error);
      } catch (err) {
        setWebcamError("Failed to connect to the backend.");
      }
    };
    checkWebcamStatus();
  }, []);

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

  useEffect(() => {
    const pipData = {
      feedUrl: webcamOn
        ? `http://localhost:8000/video_feed/${cameraIndex}`
        : "",
      webcamOn,
      isPipMode,
    };
    console.log("Updating localStorage with pipData:", pipData);
    localStorage.setItem("pipData", JSON.stringify(pipData));

    if (!webcamOn && pipWindowRef.current) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
      setIsPipMode(false);
    }
  }, [webcamOn, cameraIndex, isPipMode]);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
      }
      localStorage.removeItem("pipData");
    };
  }, []);

  const toggleAnalysis = () => {
    setIsAnalysisOpen(!isAnalysisOpen);
  };

  const startWebcam = async () => {
    try {
      const response = await fetch("http://localhost:8000/start_webcam");
      const data = await response.json();
      setWebcamError("");
      setWebcamOn(true);
      setScanning(false);
      setFeedError(false);
      console.log(data.message);
    } catch (err) {
      setWebcamError("Failed to start webcam.");
    }
  };

  const stopWebcam = async () => {
    try {
      const response = await fetch("http://localhost:8000/stop_webcam");
      const data = await response.json();
      setExtractedUrl("");
      setSafetyStatus({ overall: "", details: {} });
      setGeminiSummary(""); // Reset Gemini summary
      setWebcamOn(false);
      setScanning(false);
      setLoading(false);
      setFeedError(false);
      console.log(data.message);
    } catch (err) {
      setWebcamError("Failed to stop webcam.");
    }
  };

  const switchCamera = async (index) => {
    try {
      const response = await fetch(
        `http://localhost:8000/switch_camera/${index}`
      );
      const data = await response.json();
      setCameraIndex(index);
      setScanning(false);
      setLoading(false);
      setIsCameraMenuOpen(false);
      setFeedError(false);
      console.log(data.message);
    } catch (err) {
      setWebcamError("Failed to switch camera.");
    }
  };

  const startScan = async () => {
    try {
      const idToken = user ? await user.getIdToken() : null;
      const response = await fetchWithAuth("http://localhost:8000/start_scan", {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      });
      const data = await response.json();
      if (response.ok) {
        setScanning(true);
        setExtractedUrl("");
        setSafetyStatus({ overall: "", details: {} });
        setGeminiSummary(""); // Reset Gemini summary
        setNotification("");
        console.log(data.message);
      } else {
        setWebcamError(data.detail || "Failed to start scan.");
      }
    } catch (err) {
      setWebcamError(authError || "Failed to start scan.");
    }
  };

  const stopScan = async () => {
    try {
      const response = await fetch("http://localhost:8000/stop_scan");
      const data = await response.json();
      setScanning(false);
      setNotification("Scan stopped successfully.");
      console.log(data.message);
    } catch (err) {
      setWebcamError("Failed to stop scan.");
    }
  };

  const getUrlResult = async () => {
    try {
      const idToken = user ? await user.getIdToken() : null;
      const response = await fetchWithAuth("http://localhost:8000/get_url", {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      });
      const data = await response.json();
      console.log("Backend response from get_url:", data);

      if (data.evaluating) {
        setLoading(true);
        console.log("Backend is evaluating URL, loading set to true");
      } else if (data.url && !data.evaluating) {
        console.log("URL detected and evaluation complete:", data.url);
        setExtractedUrl(data.url);
        setSafetyStatus(
          data.safety_status || { overall: "Unknown", details: {} }
        );
        setGeminiSummary(data.gemini_summary || "No summary available"); // Store Gemini summary
        setLoading(false);
        console.log("Evaluation complete, loading set to false");
        await stopScan();
      } else {
        setLoading(false);
        console.log("No URL detected or evaluating in response");
      }
    } catch (err) {
      console.error("Error in getUrlResult:", err);
      setWebcamError(authError || "Failed to get URL result.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (scanning) {
      interval = setInterval(getUrlResult, 500);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const toggleCameraMenu = (e) => {
    e.stopPropagation();
    setIsCameraMenuOpen(!isCameraMenuOpen);
  };

  const toggleNavMenu = (e) => {
    e.stopPropagation();
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const navigateToImageScan = () => {
    navigate("/url-scan/image");
    setIsNavMenuOpen(false);
  };

  const navigateToUrlSearch = () => {
    navigate("/url-scan/search");
    setIsNavMenuOpen(false);
  };

  const togglePipMode = () => {
    if (isPipMode) {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
        pipWindowRef.current = null;
      }
      setIsPipMode(false);
    } else {
      localStorage.setItem(
        "pipData",
        JSON.stringify({
          feedUrl: `http://localhost:8000/video_feed/${cameraIndex}`,
          webcamOn,
          isPipMode: true,
        })
      );

      setTimeout(() => {
        const pipWindow = window.open(
          "/pip-window",
          "pipWindow",
          "width=300,height=200,alwaysOnTop=true,toolbar=no,menubar=no,scrollbars=no"
        );
        if (pipWindow) {
          pipWindowRef.current = pipWindow;
          setIsPipMode(true);

          pipWindow.onbeforeunload = () => {
            pipWindowRef.current = null;
            setIsPipMode(false);
          };
        } else {
          console.error("Failed to open PiP window. Check popup blockers.");
        }
      }, 100);
    }
  };

  const handleFeedError = () => {
    setFeedError(true);
    console.error("Failed to load webcam feed.");
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-5">
        <div className="relative" ref={navMenuRef}>
          <button
            onClick={toggleNavMenu}
            className="flex items-center px-2 py-1 rounded-md hover:bg-gray-300 transition-all"
          >
            <h1 className="text-3xl font-bold bg-gray-700 text-transparent bg-clip-text leading-tight">
              TrustLens Live Scan
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
            <div className="absolute top-10 left-74 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700 z-50 w-48">
              <button
                onClick={navigateToImageScan}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700"
              >
                Image Scan
              </button>
              <button
                onClick={navigateToUrlSearch}
                className="block w-full text-left px-4 py-2 text-md font-semibold hover:bg-gray-700"
              >
                Safe Search
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-lg">
          <div className="relative">
            {webcamOn && (
              <div
                className={`absolute top-2 left-2 text-white px-2 py-1 rounded-md flex items-center shadow-md group ${
                  webcamError
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                    : "bg-gradient-to-r from-red-600 to-red-500"
                } z-10`}
              >
                <span className="h-2 w-2 bg-white rounded-full mr-1 animate-heartbeat"></span>
                <span className="text-xs font-bold">LIVE</span>
                <span className="text-xs ml-2">{currentTime}</span>
                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-0">
                  Webcam is currently streaming
                </div>
              </div>
            )}

            <div className="h-105 bg-gray-200 flex items-center justify-center relative">
              {webcamOn ? (
                loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 bg-opacity-50">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500 mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="text-blue-500 font-medium">
                      Evaluating URL...
                    </p>
                  </div>
                ) : feedError ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Failed to load webcam feed
                  </div>
                ) : (
                  <img
                    src={`http://localhost:8000/video_feed/${cameraIndex}`}
                    alt="Webcam Feed"
                    className="w-full h-full object-cover"
                    onError={handleFeedError}
                  />
                )
              ) : (
                <div className="text-gray-500">Webcam Off</div>
              )}
              {webcamOn && !loading && (
                <button
                  onClick={togglePipMode}
                  className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 transition-all z-10"
                  title={
                    isPipMode
                      ? "Exit Picture-in-Picture Mode"
                      : "Enter Picture-in-Picture Mode"
                  }
                >
                  <PiPictureInPicture className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {webcamOn ? (
                <>
                  <button
                    onClick={stopWebcam}
                    className="bg-gradient-to-r mr-10 font-semibold from-gray-800 to-gray-600 text-white rounded-md py-2 px-4 flex items-center shadow-md hover:from-gray-700 hover:to-gray-500 transition-all"
                  >
                    <BsCameraVideoOff className="h-6 w-7 mr-2" />
                    STOP WEBCAM
                  </button>
                  {scanning ? (
                    <button
                      onClick={stopScan}
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md py-2 px-4 flex items-center shadow-md hover:from-red-500 hover:to-red-400 transition-all"
                    >
                      <FaCirclePause className="w-6 h-6 mr-2" />
                      STOP SCAN
                    </button>
                  ) : (
                    <button
                      onClick={startScan}
                      className={`bg-gradient-to-r font-semibold from-green-600 to-green-500 text-white rounded-md py-2 px-4 flex items-center shadow-md hover:from-green-500 hover:to-green-400 transition-all ${
                        webcamError ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={webcamError}
                    >
                      <FaCirclePlay className="w-6 h-6 mr-2" />
                      START SCAN
                    </button>
                  )}
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={startWebcam}
                    className="bg-gradient-to-r from-gray-800 to-gray-600 font-bold text-white rounded-md py-2 pl-4 pr-2 flex items-center shadow-md hover:from-gray-700 hover:to-gray-500 transition-all"
                  >
                    <BsCameraVideo className="h-6 w-7 mr-2" />
                    START WEBCAM
                    <div className="w-px h-6 bg-gray-500 mx-2"></div>
                    <span
                      onClick={toggleCameraMenu}
                      className="px-2 py-1 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isCameraMenuOpen ? "rotate-180" : ""
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
                    </span>
                  </button>

                  {isCameraMenuOpen && (
                    <div className="absolute bottom-13 left-[59%] transform -translate-x-1/2 bg-gray-800 text-white rounded-md shadow-lg border border-gray-700 z-50 w-48">
                      <button
                        onClick={() => switchCamera(0)}
                        className={`block w-full text-left font-semibold px-4 py-2 text-md hover:bg-gray-700 ${
                          cameraIndex === 0 ? "bg-gray-700" : ""
                        }`}
                      >
                        Laptop Webcam
                      </button>
                      <button
                        onClick={() => switchCamera(1)}
                        className={`block w-full text-left font-semibold px-4 py-2 text-md hover:bg-gray-700 ${
                          cameraIndex === 1 ? "bg-gray-700" : ""
                        }`}
                      >
                        External Webcam
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <UrlResult extractedUrl={extractedUrl} safetyStatus={safetyStatus} />

          {notification ? (
            <div className="px-3 py-2 rounded-md bg-gradient-to-r from-green-100 to-green-50 border border-green-200 text-green-700 shadow-md">
              <h2 className="font-semibold">Notification</h2>
              <p>{notification}</p>
            </div>
          ) : null}

          {(webcamError || authError) && (
            <div className="px-2 py-2 rounded-md bg-gradient-to-r from-red-100 to-red-50 border border-red-200 text-red-700 shadow-md">
              <h2 className="font-semibold">Error</h2>
              <p>{webcamError || authError}</p>
            </div>
          )}
        </div>

        <div className="w-1/2">
          <UrlAnalysis
            extractedUrl={extractedUrl}
            safetyStatus={safetyStatus}
            gemini_summary={geminiSummary} // Pass the stored Gemini summary
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

export default WebcamScan;
