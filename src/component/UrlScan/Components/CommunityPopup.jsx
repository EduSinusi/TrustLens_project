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

    setLoading(true);
    try {
      const scanId = Date.now().toString();
      await addDoc(collection(db, "Community"), {
        url,
        comment,
        userId,
        name: userName,
        scanId,
        timestamp: new Date(),
      });
      toast.success("Comment added successfully!");
      setComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/70 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col transform transition-all duration-300 scale-100 hover:scale-[1.005]">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-4 rounded-t-2xl animate-pulse-once">
          <h3 className="text-2xl font-bold tracking-wide">Community Chat Forum</h3>
        </div>

        <div className="flex-1 p-4 overflow-y-auto" ref={chatContainerRef}>
          {loading ? (
            <p className="text-center text-gray-600">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-600">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="p-3 bg-blue-100 rounded-lg shadow-md">
                  <p className="text-sm font-semibold text-gray-800">{c.name || c.userId}</p>
                  <p className="text-gray-700 mt-1">{c.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div>
            <label htmlFor="url" className="block text-lg font-semibold text-gray-700 ml-1">
              URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              className="mt-2 block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
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
              className="mt-2 block w-full rounded-lg border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 transition duration-200 ease-in-out hover:bg-gray-50 resize-y"
              rows={3}
              placeholder="Share your thoughts about this website..."
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 rounded-lg shadow-md font-semibold hover:from-gray-400 hover:to-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Comment"}
            </button>
          </div>
        </form>
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