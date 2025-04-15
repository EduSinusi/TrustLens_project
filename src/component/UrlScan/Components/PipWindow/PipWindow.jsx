// src/component/UrlScan/Components/PipWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import { PiPictureInPicture } from "react-icons/pi";

const PipWindow = () => {
  const [feedUrl, setFeedUrl] = useState("");
  const [feedError, setFeedError] = useState(false);
  const pipRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    window.opener.postMessage(
      {
        type: "PIP_READY",
      },
      "http://localhost:3000"
    );

    const handleMessage = (event) => {
      if (event.origin !== "http://localhost:3000") return;
      const data = event.data;
      if (data.type === "SET_FEED_URL") {
        console.log("Received feed URL in PipWindow:", data);
        setFeedUrl(data.feedUrl || "");
        setFeedError(false);

        if (!data.webcamOn) {
          window.close();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      window.moveTo(
        e.screenX - dragStartRef.current.x,
        e.screenY - dragStartRef.current.y
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e) => {
      const bounds = window.screen;
      dragStartRef.current = {
        x: e.screenX - bounds.availLeft,
        y: e.screenY - bounds.availTop,
      };
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const pipElement = pipRef.current;
    if (pipElement) {
      pipElement.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      if (pipElement) {
        pipElement.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, []);

  const handleFeedError = () => {
    setFeedError(true);
    console.error("Failed to load webcam feed in PiP window.");
  };

  const togglePipMode = () => {
    window.close();
  };

  return (
    <div
      ref={pipRef}
      className="bg-gray-800 rounded-lg shadow-lg w-[300px] h-[200px] overflow-hidden"
      style={{ cursor: "move" }}
    >
      {feedUrl ? (
        feedError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Failed to load webcam feed
          </div>
        ) : (
          <img
            src={feedUrl}
            alt="Webcam Feed (PiP)"
            className="w-full h-full object-cover rounded-lg"
            onError={handleFeedError}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No Feed Available
        </div>
      )}
      <button
        onClick={togglePipMode}
        className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 transition-all z-10"
        title="Exit Picture-in-Picture Mode"
      >
        <PiPictureInPicture className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PipWindow;