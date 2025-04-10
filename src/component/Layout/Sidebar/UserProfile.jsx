// SidebarUserProfile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../../../firebase/firebase"; // Adjust path as needed
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { MoreVertical } from "lucide-react";
import Spinner from "../../Spinner"; // Adjust path as needed

const SidebarUserProfile = ({ expanded }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState("./default-profile.webp");
  const [firstName, setFirstName] = useState("Guest");
  const [lastName, setLastName] = useState("User");
  const [userEmail, setUserEmail] = useState("guest@trustlens.com");
  const dropdownRef = useRef(null);

  // Sync user data with Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setProfilePic(user.photoURL || "./default-profile-pic.png");
        setUserEmail(user.email || "guest@trustlens.com");

        // Fetch from Firestore
        try {
          const userDocRef = doc(db, "UserInformation", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFirstName(data.firstName || "Guest");
            setLastName(data.lastName || "User");
          } else {
            // Fallback to splitting displayName if Firestore data not found
            if (user.displayName) {
              const nameParts = user.displayName.trim().split(" ");
              setFirstName(nameParts[0] || "Guest");
              setLastName(nameParts[1] || "User");
            } else {
              setFirstName("Guest");
              setLastName("User");
            }
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          toast.error("Failed to load user data");
        }
      } else {
        // Reset to default after signing out
        setProfilePic("./default-profile.webp");
        setFirstName("Guest");
        setLastName("User");
        setUserEmail("guest@trustlens.com");
      }
    });
    return () => unsubscribe();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/welcome");
    } catch (error) {
      toast.error("Logout failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit profile handler
  const handleEditProfile = () => {
    console.log("Edit Profile clicked");
    navigate("/edit-profile");
    setIsDropdownOpen(false);
  };

  // View profile handler
  const handleViewProfile = () => {
    console.log("View Profile clicked");
    navigate("/user-profile");
    setIsDropdownOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent click from triggering click-outside handlers
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-1 flex p-3 relative shadow-xl rounded-t-lg bg-gradient-to-b from-gray-100 to-stone-200">
      <img
        src={profilePic}
        alt="User Profile"
        className="w-14 h-14 rounded-sm object-cover shadow-2xl "
      />
      <div
        className={`flex justify-between items-center overflow-hidden transition-all ${
          expanded ? "w-52 ml-2" : "w-0"
        }`}
      >
        <div className="leading-4">
          <h4 className="font-semibold text-lg">
            {firstName} {lastName}
          </h4>
          <span className="text-[15px] text-gray-600">{userEmail}</span>
        </div>
        <button
          onClick={toggleDropdown}
          className="focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-0 rounded-full p-1"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {isDropdownOpen && expanded && (
        <div
          ref={dropdownRef}
          className="absolute bottom-16 left-20 w-50 bg-white border border-gray-200 rounded-md shadow-lg z-10"
        >
          <div className="py-1">
            <button
              onClick={handleViewProfile}
              className="block w-full text-left text-[17px] px-4 py-2 text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              View Profile
            </button>
            <button
              onClick={handleEditProfile}
              className="block w-full text-left text-[17px] px-4 py-2 text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-[17px] font-semibold px-4 py-2 text-red-800 hover:bg-gray-100"
              disabled={loading}
            >
              {loading ? <Spinner /> : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarUserProfile;
