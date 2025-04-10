import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
import Lottie from "lottie-react";
import animationLandingPage from "../../src/assets/animation-landingpage.json";

const LandingPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex flex-col ">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-6 shadow-md">
        <div className="flex items-center space-x-2">
          <img src="trustlens-logo.png" className="w-14 h-14 mr-4" />
          <h1 className="text-3xl font-bold text-sky-900">TrustLens System</h1>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <button className="text-sky-600 text-lg font-semibold hover:text-sky-800 transition-colors">
              Log In
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-blue-600 text-lg text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600 transition-colors">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center max-w-6xl">
          <div className="mb-1 flex justify-center">
            <Lottie
              animationData={animationLandingPage}
              loop={true}
              style={{ width: 240, height: 240 }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Secure Your Browsing with TrustLens
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Detect threats, improve performance, and enhance security in
            real-time with our powerful OCR-based URL scanning tool.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login">
              <button className="bg-sky-700 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-sky-700 hover:scale-105 transition-all">
                Log In
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-blue-600 hover:scale-105 transition-all">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-4 bg-gray-100 text-center">
        <p className="text-gray-600 mb-4">
          Trusted by security professionals worldwide
        </p>
        <div className="flex justify-center space-x-6 space-y-2">
          <FaFacebook className="w-5 h-5" />
          <FaInstagram className="w-5 h-5" />
          <FaXTwitter className="w-5 h-5" />
          <AiFillTikTok className="w-6 h-6" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
