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

  // Fetch user data on component mount
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

        // Get basic user info from Firebase Authentication
        const userInfo = {
          email: user.email || "",
          photoURL: user.photoURL || "",
        };

        // Fetch additional user info from Firestore
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

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to log out: " + err.message);
    }
  };

  if (loading) {
          <Spinner />
  }

  return (
    <div className="bg-gradient-to-b from-sky-500 to-gray-200 h-full flex items-center justify-center">
      <div className="flex w-full max-w-[1200px] mx-auto">
        {/* Left side with logo */}
        <div className="w-[50%] flex items-center justify-center opacity-70">
          <div className="text-center">
            <img
              src="./trustlens-logo.png"
              alt="TrustLens Logo"
              className="w-120 h-120 mr-60"
            />
          </div>
        </div>

        {/* Right side with profile details */}
        <div className="w-[45%] mt-4 py-10 px-8 rounded-xl shadow-xl border-1 border-gray-500">
          <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
            My Profile
          </h1>

          {/* Profile Picture and Name */}
          <div className="flex flex-col items-center justify-center mb-8">
            {userData.photoURL ? (
              <img
                src={userData.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mb-4">
                No Photo
              </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-800">
              {userData.firstName} {userData.lastName}
            </h2>
          </div>

          {/* Profile Details */}
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-lg font-medium mb-2 ml-1 text-shadow-sm">
                E-mail Address:{" "}
                <p className="w-[90%] rounded-lg text-gray-800">
                  {userData.email || "Not provided"}
                </p>
              </label>
            </div>

            {/* Joined Date */}
            <div>
              <label className="block text-lg font-medium mb-2 ml-1 text-shadow-sm">
                Joined On:
              </label>
              <p className="w-full p-2 border-[2px] border-gray-700 rounded-lg bg-gray-200 text-gray-800">
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "Not provided"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}

          {/* Edit Profile and Logout Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Link
              to="/edit-profile"
              className="w-40 py-1.5 bg-gray-600 text-[18px] text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none text-center"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-40 py-1.5 bg-red-600 text-[18px] text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
