// src/components/FeedbackFormPopup.jsx
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { auth, storage } from "../../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";

const FeedbackFormPopup = ({ isOpen, onClose, url }) => {
  const [feedbackType, setFeedbackType] = useState("");
  const [comments, setComments] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const popupRef = useRef(null); // Added useRef for click-outside detection

  // Handle screenshot input change (preview and validation)
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }
      setScreenshot(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle click outside to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle form submission with screenshot upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let screenshotUrl = null;

      if (screenshot) {
        const user = auth.currentUser;
        const userId = user ? user.uid : "anonymous";
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const storagePath = `feedback-screenshots/${userId}/${encodeURIComponent(
          url
        )}-${timestamp}`;
        const storageRef = ref(storage, storagePath);

        console.log("Uploading screenshot to:", storagePath);
        await uploadBytes(storageRef, screenshot);
        screenshotUrl = await getDownloadURL(storageRef);
        console.log("Uploaded screenshot URL:", screenshotUrl);
      }

      const feedbackData = {
        url,
        feedbackType,
        comments,
        screenshotUrl,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser ? auth.currentUser.uid : null,
      };

      console.log("Feedback submitted:", feedbackData);
      toast.success("Feedback submitted successfully!");

      setFeedbackType("");
      setComments("");
      setScreenshot(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      setError("Failed to submit feedback: " + err.message);
      toast.error("Failed to submit feedback: " + err.message);
      console.error("Feedback submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFeedbackType("");
    setComments("");
    setScreenshot(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 transition-opacity duration-300">
      <div
        ref={popupRef} // Attach popupRef to the popup container
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 hover:scale-[1.01]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 rounded-t-xl">
          <h3 className="text-xl font-semibold">Submit Feedback</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* URL Field */}
          <div>
            <label
              htmlFor="url"
              className="ml-1 block text-md font-medium text-gray-700"
            >
              URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed px-3 py-2 focus:outline-none"
              disabled
            />
          </div>

          {/* Feedback Type */}
          <div>
            <label
              htmlFor="feedbackType"
              className="block text-md ml-1 font-medium text-gray-700"
            >
              Feedback Type
            </label>
            <select
              id="feedbackType"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
              required
              disabled={loading}
            >
              <option value="" disabled>
                Select feedback type
              </option>
              <option value="False Positive">
                False Positive (Incorrectly marked unsafe)
              </option>
              <option value="False Negative">
                False Negative (Incorrectly marked safe)
              </option>
              <option value="Suspicious Behavior">Suspicious Behavior</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label
              htmlFor="comments"
              className="block text-md ml-1 font-medium text-gray-700"
            >
              Comments
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
              rows={4}
              placeholder="Describe the issue..."
              required
              disabled={loading}
            />
          </div>

          {/* Screenshot Upload */}
          <div>
            <label
              htmlFor="screenshot"
              className="block text-md ml-1 font-medium text-gray-700"
            >
              Screenshot (Optional)
            </label>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:file:bg-gray-200 disabled:file:text-gray-500 transition duration-150 ease-in-out"
              disabled={loading}
            />
            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="max-w-full h-auto rounded-md shadow-md border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-white bg-red-500 px-3 py-2 rounded-md animate-fade-in">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-md shadow-sm hover:from-gray-300 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition duration-150 ease-in-out"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

FeedbackFormPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
};

export default FeedbackFormPopup;