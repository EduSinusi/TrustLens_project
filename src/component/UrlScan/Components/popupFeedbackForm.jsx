import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { auth, storage, db } from "../../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const PersonalNotePopup = ({ isOpen, onClose, url }) => {
  const [comments, setComments] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Authenticated user:", user.uid);
        setUserId(user.uid);
      } else {
        console.log("No authenticated user");
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("Please log in to add a personal note.");
      setLoading(false);
      toast.error("Please log in to add a personal note.");
      return;
    }

    try {
      let screenshotUrl = null;

      if (screenshot) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const storagePath = `notes-screenshots/${userId}/${encodeURIComponent(url)}-${timestamp}`;
        const storageRef = ref(storage, storagePath);

        console.log("Uploading screenshot to:", storagePath);
        await uploadBytes(storageRef, screenshot);
        screenshotUrl = await getDownloadURL(storageRef);
        console.log("Uploaded screenshot URL:", screenshotUrl);
      }

      const noteData = {
        url,
        comments,
        timestamp: Timestamp.fromDate(new Date()),
        userId,
      };

      if (screenshotUrl) {
        noteData.screenshotUrl = screenshotUrl;
      }

      console.log("Submitting note data:", noteData);

      const userNotesCollectionRef = collection(db, `users/${userId}/user_feedback`);
      await addDoc(userNotesCollectionRef, noteData);
      console.log(`Successfully wrote to users/${userId}/user_feedback`);

      toast.success("Personal note added successfully!");
      setComments("");
      setScreenshot(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      setError("Failed to add note: " + err.message);
      toast.error("Failed to add note: " + err.message);
      console.error("Note submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setComments("");
    setScreenshot(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50 transition-opacity duration-300">
      <div
        ref={popupRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 hover:scale-[1.02]"
      >
        <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-center py-4 rounded-t-2xl animate-pulse-once">
          <h3 className="text-2xl font-bold tracking-wide">
            Add Personal Note
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <div>
            <label
              htmlFor="url"
              className="block text-lg font-semibold text-gray-700 ml-1"
            >
              URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              className="mt-2 block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed px-4 py- personally-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              disabled
            />
          </div>

          <div>
            <label
              htmlFor="comments"
              className="block text-lg font-semibold text-gray-700 ml-1"
            >
              Note
            </label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-2 block w-full rounded-lg border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition duration-200 ease-in-out hover:bg-gray-50 resize-y"
              rows={5}
              placeholder="Add your personal note about this website..."
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="screenshot"
              className="block text-lg font-semibold text-gray-700 ml-1"
            >
              Screenshot (Optional)
            </label>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:file:bg-gray-200 disabled:file:text-gray-500 transition duration-200 ease-in-out"
              disabled={loading}
            />
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-300 transition duration-200 hover:shadow-lg"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-white bg-red-600 px-4 py-2 rounded-lg animate-fade-in-out">
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 rounded-lg shadow-md font-semibold hover:from-gray-400 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Adding Note..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PersonalNotePopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
};

export default PersonalNotePopup;