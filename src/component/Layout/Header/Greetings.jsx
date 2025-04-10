import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { auth, db } from "../../../firebase/firebase"; // Adjust path as needed
import { doc, getDoc } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa";

const Greetings = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const displayName = "";

  // Sync user data with Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch from Firestore
        try {
          const userDocRef = doc(db, "UserInformation", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFirstName(data.firstName || "Guest");
            setLastName(data.lastName || "User");

            // Update Firebase displayName if not already set
            if (
              !user.displayName ||
              user.displayName !== `${data.firstName} ${data.lastName}`
            ) {
              await updateProfile(user, {
                displayName: `${data.firstName} ${data.lastName}`,
              });
            }
          } else {
            // Fallback to splitting displayName if Firestore data not found
            if (user.displayName) {
              const nameParts = user.displayName.trim().split(" ");
              setFirstName(nameParts[0] || "Guest");
              setLastName(nameParts[1] || "User");
            } else {
              setFirstName("Guest");
              setLastName("User");
              await updateProfile(user, {
                displayName: "Guest User",
              });
            }
          }

          displayName;
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          toast.error("Failed to load user data");
        }
      } else {
        // Reset to default after signing out
        setFirstName("Guest");
        setLastName("User");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="px-7 flex justify-center items center flex-row">
      <p className="text-xl font-bold text-gray-800 py-3">
        Hello {firstName} {lastName}!
      </p>
      <FaUserCircle className="ml-4 w-13 h-13 gray-100" />
    </div>
  );
};

export default Greetings;
