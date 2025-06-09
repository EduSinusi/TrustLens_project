import React, { useState, useEffect } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { SiDowndetector } from "react-icons/si";
import { ImBlocked } from "react-icons/im";
import { MdFeedback } from "react-icons/md";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const SummaryStats = ({ analyticsData, user }) => {
  const [totalFeedback, setTotalFeedback] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "user_feedback"),
      (snapshot) => {
        setTotalFeedback(snapshot.size);
      },
      (error) => {
        console.error("Error fetching feedback:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center">
          <FaShieldAlt className="h-7 w-7 text-blue-600 mr-4" />
          <h2 className="text-lg font-semibold text-gray-800">Total Scans</h2>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-3">
          {analyticsData.totalScans}
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center">
          <SiDowndetector className="h-7 w-7 text-blue-600 mr-4" />
          <h2 className="text-lg font-semibold text-gray-800">Unsafe URLs</h2>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-3">
          {analyticsData.safetyBreakdown.Unsafe || 0}
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center">
          <ImBlocked className="h-7 w-7 text-blue-600 mr-4" />
          <h2 className="text-lg font-semibold text-gray-800">Blocked URLs</h2>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-3">
          {analyticsData.blockedCount}
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-center">
          <MdFeedback className="h-7 w-7 text-blue-600 mr-4" />
          <h2 className="text-lg font-semibold text-gray-800">
            Feedback Provided
          </h2>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-3">{totalFeedback}</p>
      </div>
    </div>
  );
};

export default SummaryStats;