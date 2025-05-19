import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import Spinner from "../component/Spinner";

export default function Profile() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photoURL: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (!user) {
          setError("No user is logged in");
          navigate("/login");
          return;
        }

        const userInfo = {
          email: user.email || "",
          photoURL: user.photoURL || "",
        };

        const userDocRef = doc(db, "UserInformation", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userDataFromFirestore = userDoc.data();
          setUserData({
            ...userInfo,
            firstName: userDataFromFirestore.firstName || "",
            lastName: userDataFromFirestore.lastName || "",
            createdAt: userDataFromFirestore.createdAt || "",
          });
        } else {
          setError("User data not found in Firestore");
        }
      } catch (err) {
        setError("Failed to load profile: " + err.message);
        toast.error("Failed to load profile: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to log out: " + err.message);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br bg-gray-100 flex items-center justify-center font-sans">
      <div className="flex w-full h-[450px] max-w-4xl bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
        {/* Left Side - Logo */}
        <div className="w-1/3 p-6 flex items-center justify-center bg-gradient-to-b from-blue-200 to-blue-300">
          <img
            src="./trustlens-logo.png"
            alt="TrustLens Logo"
            className="w-2/3 max-w-[200px] h-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        {/* Right Side - Profile Details */}
        <div className="w-2/3 p-8 flex flex-col justify-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            My Profile
          </h1>

          {/* Profile Picture and Name */}
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="relative group">
              {userData.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/50 shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-100/50 flex items-center justify-center text-gray-500 text-xs border-2 border-white/50">
                  No Photo
                </div>
              )}
            </div>
            <h2 className="text-lg font-medium text-gray-800 mt-2">
              {userData.firstName} {userData.lastName}
            </h2>
          </div>

          {/* Profile Details */}
          <div className="space-y-2">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="w-full p-1.5 border border-gray-200/50 rounded-md bg-white/50 text-gray-800 text-sm">
                {userData.email || "Not provided"}
              </p>
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Joined On
              </label>
              <p className="w-full p-1.5 border border-gray-200/50 rounded-md bg-white/50 text-gray-800 text-sm">
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "Not provided"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-[10px] text-center mt-3">{error}</p>
          )}

          {/* Edit Profile and Logout Buttons */}
          <div className="flex justify-center space-x-3 mt-6">
            <Link
              to="/edit-profile"
              className="w-1/3 py-1.5 bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 text-sm text-center"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-1/3 py-1.5 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 text-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}