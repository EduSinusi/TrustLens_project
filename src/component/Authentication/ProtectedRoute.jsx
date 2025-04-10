import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Spinner from "../Spinner";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null); // Store the authenticated user
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser); // Set the user if authenticated, or null if not
      setLoading(false); // Stop loading once auth state is determined
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // Show a loading indicator while checking auth state
  if (loading) {
    return <Spinner />;
  }

  // If user is authenticated, render the children (protected content)
  // Otherwise, redirect to the login page
  return user ? children : <Navigate to="/welcome" replace />;
};

export default ProtectedRoute;
