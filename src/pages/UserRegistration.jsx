import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BsBoxArrowLeft } from "react-icons/bs";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { RecaptchaVerifier } from "firebase/auth";

export default function UserRegistration() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Setup and cleanup reCAPTCHA verifier
  useEffect(() => {
    let recaptchaVerifier;
    if (!window.recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal", // Visible checkbox
        callback: (response) => {
          console.log("reCAPTCHA verified:", response);
        },
        "expired-callback": () => {
          setError("reCAPTCHA verification expired. Please try again.");
          renderRecaptcha(); // Re-render on expiration
        },
      });
      window.recaptchaVerifier = recaptchaVerifier;
    } else {
      recaptchaVerifier = window.recaptchaVerifier;
    }

    // Render the reCAPTCHA widget
    const renderRecaptcha = () => {
      recaptchaVerifier
        .render()
        .then((widgetId) => {
          window.recaptchaWidgetId = widgetId;
        })
        .catch((err) => {
          console.error("Failed to render reCAPTCHA:", err);
          setError("Failed to load reCAPTCHA. Please refresh the page.");
        });
    };
    renderRecaptcha();

    // Cleanup function to reset reCAPTCHA on unmount or re-render
    return () => {
      if (recaptchaVerifier && window.recaptchaWidgetId) {
        window.recaptchaVerifier.reset(window.recaptchaWidgetId);
        delete window.recaptchaVerifier;
        delete window.recaptchaWidgetId;
      }
    };
  }, []); // Empty dependency array ensures it runs only on mount

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const recaptchaVerifier = window.recaptchaVerifier;
      if (!recaptchaVerifier) {
        setError("reCAPTCHA not initialized. Please refresh the page.");
        setLoading(false);
        return;
      }
      // Ensure reCAPTCHA is verified before proceeding
      recaptchaVerifier
        .verify()
        .then(() => {
          // Create user with email and password
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              // Store additional user info in Firestore
              return setDoc(doc(db, "UserInformation", user.uid), {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                photo: "",
                createdAt: new Date().toISOString(),
              })
                .then(() => {
                  console.log("User registered successfully");
                  toast.success("Registration Successful!");
                  navigate("/login");
                });
            })
            .catch((err) => {
              setError(err.message);
              toast.error("Registration failed: " + err.message);
            })
            .finally(() => setLoading(false));
        })
        .catch((err) => {
          setError(
            "Please complete the reCAPTCHA verification: " + err.message
          );
          toast.error(
            "Please complete the reCAPTCHA verification: " + err.message
          );
          recaptchaVerifier.render().catch((renderErr) => {
            console.error("Failed to render reCAPTCHA:", renderErr);
          });
          setLoading(false);
        });
    } catch (err) {
      setError(err.message);
      toast.error("Registration failed: " + err.message);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gradient-to-r from-sky-600 to-blue-50 min-h-screen flex items-center justify-center">
      <div className="flex w-full max-w-[1400px] mx-auto">
        {/* Back Button */}
        <div className="absolute top-4 left-5">
          <Link to="/welcome" className="flex items-center space-x-2">
            <BsBoxArrowLeft className="w-5 h-5 text-slate-900 mr-3" />
            <h1 className="text-[15px] font-semibold text-slate-900 hover:underline">
              Back
            </h1>
          </Link>
        </div>
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
        <div className="w-[60%] h-[85%] bg-white p-8 rounded-lg shadow-2xl border-none border-gray-500">
          <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
            Register User
          </h1>
          <form className="space-y-5" onSubmit={handleRegister}>
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
                className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
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
                className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                required
              />
            </div>

            {/* Email */}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="j.andrew@gmail.com"
                className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                required
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
                className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
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

            {/* reCAPTCHA container for visible checkbox */}
            <div id="recaptcha-container" className="mb-4"></div>

            {/* Register Button */}
            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-60 py-1.5 bg-gray-600 text-[18px] text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none"
              >
                Create New Account
              </button>
            </div>
          </form>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}

          {/* Sign in link */}
          <div className="text-center mt-5">
            <p className="text-[16px] text-gray-600 flex justify-center space-x-1 italic">
              <span>Already have an account?</span>
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}