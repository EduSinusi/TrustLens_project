import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { db } from "../../firebase/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { MdFeedback } from "react-icons/md";

const PersonalNotesSection = ({ scans, userId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedNotes, setExpandedNotes] = useState({});

  useEffect(() => {
    if (!userId) {
      setError("Please log in to view your personal notes.");
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      setLoading(true);
      setError("");

      try {
        const notesRef = collection(db, "users", userId, "user_feedback");
        const q = query(notesRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedNotes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));

        console.log("Personal Notes Data:", fetchedNotes);
        setNotes(fetchedNotes);
      } catch (err) {
        console.error("Error fetching personal notes:", err);
        setError(`Failed to fetch personal notes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  const toggleNoteDetails = (noteId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-gray-800 text-lg font-medium">
          Loading Personal Notes...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-lg font-medium p-4">{error}</div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Personal Notes
      </h2>
      {notes.length === 0 ? (
        <p className="text-gray-600 text-lg">No personal notes available.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const scan = scans.find((s) => s.url === note.url);
            return (
              <div
                key={note.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MdFeedback className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-800">{note.url}</p>
                      <p className="text-sm text-gray-600">
                        Added on: {note.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNoteDetails(note.id)}
                    className="text-blue-600 hover:underline focus:outline-none"
                  >
                    {expandedNotes[note.id] ? "Hide Details" : "Show Details"}
                  </button>
                </div>
                {expandedNotes[note.id] && (
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Note:</span> {note.comments}
                    </p>
                    {note.screenshotUrl && (
                      <div>
                        <p className="font-medium text-gray-700">Screenshot:</p>
                        <img
                          src={note.screenshotUrl}
                          alt="Note screenshot"
                          className="max-w-full h-auto rounded-lg shadow-md border border-gray-300 mt-2"
                        />
                      </div>
                    )}
                    {scan && (
                      <p className="text-gray-700">
                        <span className="font-medium">Scan Status:</span>{" "}
                        <span
                          className={`font-medium ${
                            scan.safety_status.overall === "Safe"
                              ? "text-green-600"
                              : scan.safety_status.overall === "Unsafe"
                              ? "text-red-600"
                              : scan.safety_status.overall === "Potentially Unsafe"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {scan.safety_status.overall}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

PersonalNotesSection.propTypes = {
  scans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      url: PropTypes.string,
      safety_status: PropTypes.shape({
        overall: PropTypes.string,
      }),
      timestamp: PropTypes.instanceOf(Date),
    })
  ).isRequired,
  userId: PropTypes.string.isRequired,
};

export default PersonalNotesSection;