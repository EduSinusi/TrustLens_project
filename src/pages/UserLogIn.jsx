import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { toast } from "react-toastify";
import { BsBoxArrowLeft } from "react-icons/bs";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function UserLogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Store token in localStorage after login
  const storeToken = async (user) => {
    try {
      const token = await getIdToken(user);
      localStorage.setItem("idToken", token);
      console.log("Token stored:", token);
    } catch (err) {
      console.error("Failed to store token:", err);
      setError("Failed to retrieve authentication token");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await storeToken(userCredential.user);
      console.log("User logged in successfully");
      toast.success("Log in Successful!");
      navigate("/home");
    } catch (err) {
      setError(err.message);
      toast.error("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await storeToken(result.user);
      console.log("Successfully signed in:", result.user.displayName);
      toast.success("Log in Successful!");
      navigate("/home");
    } catch (err) {
      setError(err.message);
      console.error("Google Sign-in Error:", err);
      toast.error("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="h-screen flex">
      {/* Back Button */}
      <div className="absolute top-4 left-5">
        <Link to="/welcome" className="flex items-center space-x-2">
          <BsBoxArrowLeft className="w-5 h-5 text-slate-300 mr-3" />
          <h1 className="text-[15px] font-semibold text-slate-300 hover:underline">
            Back 
          </h1>
        </Link>
      </div>
      {/* Left side - 60% with the logo and gradient */}
      <div
        className="w-4/5 bg-gradient-to-r from-sky-800 to-blue-200 flex justify-center items-center"
        style={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)" }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-7xl font-bold text-sky-950 mb-2.5"
            style={{ textShadow: "2px 5px 7px rgba(0, 0, 0, 0.5)" }}
          >
            Welcome Back
          </h1>
          <h2 className="text-4xl font-semibold text-sky-950">
            TrustLens System
          </h2>
          <img
            src="./trustlens-logo.png"
            alt="TrustLens Logo"
            className="w-[450px] h-auto opacity-80 mt-3.5"
          />
        </div>
      </div>

      {/* Right side - 40% with the login form */}
      <div className="w-2/5 bg-white p-8 flex flex-col justify-center items-center shadow-2xl">
        <h1 className="text-4xl font-bold text-blue-950 mb-12">Log In</h1>
        <form className="w-97 items-center" onSubmit={handleLogin}>
          {/* Email input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700 mb-2 ml-1"
            >
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password input */}
          <div className="mb-6 w-full relative">
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700 mb-2 ml-1"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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

          {/* Login button */}
          <div className="mb-2.5 align-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white text-[18px] font-semibold rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              Log In
            </button>
          </div>

          {/* Google login button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none flex items-center justify-center"
            >
              <img
                src="./google-logo.png"
                alt="Google logo"
                className="w-7 mr-4"
              />
              Sign in with Google
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {/* Register link */}
        <div className="text-center text-[15px]">
          <p className="text-gray-600 italic">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}