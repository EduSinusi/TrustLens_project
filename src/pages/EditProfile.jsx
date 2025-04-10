import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
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
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log("Current user UID:", user.uid); // Log UID for debugging
        setEmail(user.email);
        setPhotoURL(user.photoURL || "");

        // Fetch additional user info from Firestore
        const userDoc = await getDoc(doc(db, "UserInformation", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setPassword(userData.password || ""); // Note: Password should ideally not be stored in Firestore
        }
      } else {
        setError("No user is logged in");
        navigate("/login"); // Redirect to login if no user is logged in
      }
    };
    fetchUserData();
  }, [navigate]);

  // Handle profile picture upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Limit to 5MB
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
        setPhotoURL(reader.result); // Preview the image
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile picture removal
  const handlePhotoRemove = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("No user is logged in");
      return;
    }

    try {
      setLoading(true);
      // Delete the old photo from Firebase Storage if it exists
      if (photoURL && !photoURL.startsWith("data:")) {
        const oldPhotoRef = ref(storage, `profile-pictures/${user.uid}`);
        console.log(
          "Attempting to delete photo at:",
          `profile-pictures/${user.uid}`
        );
        await deleteObject(oldPhotoRef).catch((err) => {
          console.warn("Error deleting old photo:", err.message);
          if (err.code !== "storage/object-not-found") {
            throw err; // Rethrow if the error is not "object not found"
          }
        });
      }

      // Update state and Firebase
      setPhotoURL("");
      setPhotoFile(null);

      // Update Firebase Authentication
      await updateProfile(user, { photoURL: "" });

      // Update Firestore
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

  // Handle form submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is logged in");

      let finalPhotoURL = photoURL;

      // If a new photo was uploaded, upload it to Firebase Storage
      if (photoFile) {
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        console.log("Uploading photo to:", `profile-pictures/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        finalPhotoURL = await getDownloadURL(storageRef);
        console.log("Uploaded photo URL:", finalPhotoURL);
        setPhotoURL(finalPhotoURL); // Update the state with the new URL
      }

      // Update Firebase Authentication profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: finalPhotoURL || "",
      });

      // Update Firestore user information
      await updateDoc(doc(db, "UserInformation", user.uid), {
        firstName,
        lastName,
        email,
        photo: finalPhotoURL || "",
        updatedAt: new Date().toISOString(),
      });

      toast.success("Profile updated successfully!");
      navigate("/user-profile"); // Redirect to profile page after update
    } catch (err) {
      setError("Failed to update profile: " + err.message);
      toast.error("Failed to update profile: " + err.message);
      console.error("Update profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gradient-to-b from-sky-500 to-gray-200 overflow-hidden h-screen flex items-center justify-center">
      <div className="flex w-full max-w-[1400px] mx-auto">
        {/* Left side with logo */}
        <div className="w-[70%] flex items-center justify-center opacity-70">
          <div className="text-center">
            <img
              src="./trustlens-logo.png"
              alt="TrustLens Logo"
              className="w-140 h-auto mr-40"
            />
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-[60%] bg-sky-750 p-8 rounded-lg shadow-xl border-2 border-gray-500">
          <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
            Edit Profile
          </h1>
          <form className="space-y-5" onSubmit={handleUpdateProfile}>
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                    No Photo
                  </div>
                )}
                <label
                  htmlFor="photo"
                  className="absolute bottom-0 right-0 bg-gray-600 p-2 rounded-full cursor-pointer hover:bg-gray-700"
                >
                  <FaCamera className="text-white" />
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              {photoURL && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="mt-2 text-red-500 hover:text-red-700 flex items-center space-x-1"
                  disabled={loading}
                >
                  <FaTrash />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-lg font-medium mb-2 ml-1 text-shadow-sm"
              >
                First Name:
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full p-2 border-[2px] border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-lg font-medium mb-2 ml-1 text-shadow-sm"
              >
                Last Name:
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Andrew"
                className="w-full p-2 border-[2px] border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100"
                required
              />
            </div>

            {/* Email (disabled for editing) */}
            <div>
              <label
                htmlFor="email"
                className="block text-lg font-medium mb-2 ml-1 text-shadow-sm"
              >
                E-mail Address:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className="w-full p-2 border-[2px] border-gray-700 rounded-lg bg-gray-200 cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-lg font-medium mb-2 ml-1 text-shadow-sm"
              >
                Password:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="hello123"
                className="w-full p-2 border-[2px] border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-14 transform -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity duration-200"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Update Button */}
            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-60 py-1.5 bg-gray-600 text-[18px] text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none"
              >
                Update Profile
              </button>
            </div>
          </form>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}

          {/* Back to Profile link */}
          <div className="text-center mt-5">
            <p className="text-[16px] text-gray-600 flex justify-center space-x-1 italic">
              <span>Back to</span>
              <a href="/user-profile" className="text-blue-600 hover:underline">
                Profile
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
