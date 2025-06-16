import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { db } from "../../../firebase/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CommunityPopup = ({ isOpen, onClose, url, userId }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [showRatingError, setShowRatingError] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && url) {
      fetchComments();
    }
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName = user.displayName || "";
        const [firstName, lastName] = displayName.split(" ") || [userId, ""];
        setUserName(`${firstName} ${lastName}`.trim() || userId);
      }
    });
    return () => unsubscribe();
  }, [isOpen, url]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "Community"),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const urlComments = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(commentData => commentData.url === url)
        .sort((a, b) => a.timestamp - b.timestamp);
      setComments(urlComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      toast.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please log in to add a community comment.");
      return;
    }

    if (rating === 0) {
      setShowRatingError(true);
      toast.error("Please provide a rating (1-5 stars) is required.");
      return;
    }

    setShowRatingError(false);
    setLoading(true);
    try {
      const scanId = Date.now().toString();
      await addDoc(collection(db, "Community"), {
        url,
        comment: comment.trim() || "No comment",
        userId,
        name: userName,
        rating: rating || 0,
        scanId,
        timestamp: new Date(),
      });
      toast.success("Comment and rating added successfully!");
      setComment("");
      setRating(0);
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating with one decimal place
  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1)
    : "0.0";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/60 z-50 transition-opacity duration-300">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-5xl h-[70vh] flex transform transition-all duration-300 scale-100 hover:scale-[1.005] border border-indigo-200/30">
        {/* Left Side - Community Chat */}
        <div className="w-1/2 p-5 overflow-y-auto rounded-tr-3xl" style={{ scrollbarWidth: "thin", scrollbarColor: "#9CA3AF #F3F4F6" }}>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white text-center py-4 rounded-tl-3xl rounded-tr-3xl sticky top-0 z-10">
            <h3 className="text-2xl font-extrabold tracking-wide">Community Chat</h3>
          </div>
          {loading ? (
            <p className="text-center text-gray-600 text-lg mt-10">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-600 text-lg mt-10">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-2xl shadow-md sticky top-16 z-10">
                <h4 className="text-lg font-semibold text-gray-800">Average Rating</h4>
                <p className="text-xl font-bold text-indigo-700">{averageRating}/5</p>
              </div>
              <div ref={chatContainerRef} className="mt-4 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-md animate-fadeIn">
                    <p className="text-sm font-medium text-gray-800">{c.name || c.userId}</p>
                    {c.rating > 0 && (
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < c.rating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-700 mt-1">{c.comment || "No comment"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Rate Website */}
        <div className="w-1/2 p-5 border-l border-gray-200/50 rounded-tl-3xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white text-center py-4 rounded-tr-3xl rounded-tl-3xl animate-pulse-once">
            <h3 className="text-2xl font-extrabold tracking-wide">Rate Website</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="url" className="block text-lg font-semibold text-gray-700 ml-1">
                URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                className="mt-2 block w-full rounded-xl border-gray-300 bg-gray-100/80 text-gray-600 cursor-not-allowed px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                disabled
              />
            </div>
            <div className="mt-4">
              <label htmlFor="comment" className="block text-lg font-semibold text-gray-700 ml-1">
                Your Comment
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2 block w-full rounded-xl border-gray-300 bg-white/90 px-4 py-2 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition duration-300 ease-in-out hover:bg-gray-50/90 resize-y"
                rows={7}
                placeholder="Share your thoughts about this website..."
                disabled={loading}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="rating" className="block text-lg font-semibold text-gray-700 ml-1">
                Rating (1-5 Stars) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 cursor-pointer ${i < rating ? "text-yellow-400" : "text-gray-300"} transition-transform hover:scale-110`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    onClick={() => setRating(i + 1)}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              {showRatingError && <p className="text-sm text-red-500 mt-1">Rating is required.</p>}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
                disabled={loading || rating === 0}
              >
                {loading ? "Sending..." : "Send Comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CommunityPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  userId: PropTypes.string,
};

export default CommunityPopup;