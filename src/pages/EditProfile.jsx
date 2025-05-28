import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaCamera, FaTrash } from "react-icons/fa";

export default function EditProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Always blank
  const [photoURL, setPhotoURL] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);
        setPhotoURL(user.photoURL || "");
        const userDoc = await getDoc(doc(db, "UserInformation", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          // Do NOT set password here!
        }
      } else {
        setError("No user is logged in");
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handlePhotoChange = (e) => {
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
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("No user is logged in");
      return;
    }
    try {
      setLoading(true);
      if (photoURL && !photoURL.startsWith("data:")) {
        const oldPhotoRef = ref(storage, `profile-pictures/${user.uid}`);
        await deleteObject(oldPhotoRef).catch((err) => {
          if (err.code !== "storage/object-not-found") throw err;
        });
      }
      setPhotoURL("");
      setPhotoFile(null);
      await updateProfile(user, { photoURL: "" });
      await updateDoc(doc(db, "UserInformation", user.uid), {
        photo: "",
        updatedAt: new Date().toISOString(),
      });
      toast.success("Profile picture removed successfully!");
    } catch (err) {
      setError("Failed to remove profile picture: " + err.message);
      toast.error("Failed to remove profile picture: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is logged in");
      let finalPhotoURL = photoURL;
      if (photoFile) {
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        finalPhotoURL = await getDownloadURL(storageRef);
        setPhotoURL(finalPhotoURL);
      }
      // Update profile info
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: finalPhotoURL || "",
      });
      // Only update password if entered and >= 6 characters
      if (password && password.length >= 6) {
        await updatePassword(user, password);
        toast.success("Password updated successfully!");
      }
      await updateDoc(doc(db, "UserInformation", user.uid), {
        firstName,
        lastName,
        email,
        photo: finalPhotoURL || "",
        updatedAt: new Date().toISOString(),
      });
      toast.success("Profile updated successfully!");
      navigate("/user-profile");
    } catch (err) {
      setError("Failed to update profile: " + err.message);
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
      setPassword(""); // Always clear the password field after submission
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-full bg-gradient-to-br bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="flex w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Logo */}
        <div className="w-1/3 bg-gradient-to-b from-blue-200 to-blue-300 p-8 flex items-center justify-center">
          <img
            src="./trustlens-logo.png"
            alt="TrustLens Logo"
            className="w-3/4 max-w-xs h-auto"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-2/3 p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Edit Profile
          </h1>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-md group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                    No Photo
                  </div>
                )}
                <label
                  htmlFor="photo"
                  className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                >
                  <FaCamera className="text-white text-sm" />
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            {photoURL && (
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="text-red-500 hover:text-red-600 text-sm flex items-center justify-center space-x-1 mx-auto transition-colors duration-200"
                  disabled={loading}
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Andrew"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-sm"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password <span className="text-xs text-gray-400">(Leave blank to keep current password)</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                minLength={6}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-4 h-4" />
                ) : (
                  <FaEye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Update Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-xs text-center mt-4">{error}</p>
          )}

          {/* Back to Profile Link */}
          <div className="text-center mt-4">
            <a
              href="/user-profile"
              className="text-blue-500 hover:underline text-sm"
            >
              Back to Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
