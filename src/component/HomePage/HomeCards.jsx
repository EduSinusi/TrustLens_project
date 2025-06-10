import React from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaCamera,
  FaImage,
  FaTachometerAlt,
  FaHistory,
  FaBook,
  FaRobot,
  FaQuestionCircle,
  FaInfoCircle,
  FaGraduationCap,
} from "react-icons/fa";

const HomeCards = () => {
  return (
    <section className="flex justify-center px-6 md:px-12 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* TrustLens Search Bar Card */}
        <div className="flex flex-col items-center rounded-3xl bg-white shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border-t-4 border-sky-500">
          <div className="bg-sky-100 p-4 rounded-full mb-4">
            <FaSearch className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            TrustLens Search Bar
          </h3>
          <p className="text-gray-600 text-center mb-10">
            Manually enter URLs to scan for threats instantly.
          </p>
          <Link to="/url-scan/search">
            <button className="bg-sky-600 text-white px-5 py-2 text-lg font-semibold rounded-lg hover:bg-sky-700 transition-colors">
              Start Manual Scan
            </button>
          </Link>
        </div>

        {/* TrustLens Live Scan Card */}
        <div className="flex flex-col items-center rounded-3xl bg-white shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border-t-4 border-sky-500">
          <div className="bg-sky-100 p-4 rounded-full mb-4">
            <FaCamera className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            TrustLens Live Scan
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Use your camera to scan URLs or QR codes in real-time.
          </p>
          <Link to="/url-scan/webcam">
            <button className="bg-sky-600 text-white px-5 py-2 text-lg font-semibold rounded-lg hover:bg-sky-700 transition-colors">
              Start Live Scan
            </button>
          </Link>
        </div>

        {/* TrustLens Image Scan Card */}
        <div className="flex flex-col items-center rounded-3xl bg-white shadow-lg p-6 transform hover:scale-105 transition-all duration-300 border-t-4 border-sky-500">
          <div className="bg-sky-100 p-4 rounded-full mb-4">
            <FaImage className="w-8 h-8 text-sky-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            TrustLens Image Scan
          </h3>
          <p className="text-gray-600 text-center mb-4">
            Upload an image containing a URL or QR code to analyze.
          </p>
          <Link to="/url-scan/image">
            <button className="bg-sky-600 text-white px-5 py-2 text-lg font-semibold rounded-lg hover:bg-sky-700 transition-colors">
              Start Image Scan
            </button>
          </Link>
        </div>

        {/* Mini Cards Section */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          {/* Dashboard Card */}
          <div className="flex flex-col items-center rounded-xl bg-gray-50 shadow-md p-4 hover:shadow-lg transition-all duration-200 border-t-2 border-sky-500">
            <div className="bg-sky-100 p-2 rounded-full mb-2">
              <FaTachometerAlt className="w-6 h-6 text-sky-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Dashboard
            </h4>
            <Link to="/dashboard">
              <button className="bg-sky-600 text-white px-3 py-1 text-sm font-medium rounded hover:bg-sky-700 transition-colors">
                View Dashboard
              </button>
            </Link>
          </div>

          {/* Scan History Card */}
          <div className="flex flex-col items-center rounded-xl bg-gray-50 shadow-md p-4 hover:shadow-lg transition-all duration-200 border-t-2 border-sky-500">
            <div className="bg-sky-100 p-2 rounded-full mb-2">
              <FaHistory className="w-6 h-6 text-sky-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Scan History
            </h4>
            <Link to="/scan-history">
              <button className="bg-sky-600 text-white px-3 py-1 text-sm font-medium rounded hover:bg-sky-700 transition-colors">
                View History
              </button>
            </Link>
          </div>

          {/* AI Chatbot Card */}
          <div className="flex flex-col items-center rounded-xl bg-gray-50 shadow-md p-4 hover:shadow-lg transition-all duration-200 border-t-2 border-sky-500">
            <div className="bg-sky-100 p-2 rounded-full mb-2">
              <FaRobot className="w-6 h-6 text-sky-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              AI Chatbot
            </h4>
            <Link to="/support/chatbot">
              <button className="bg-sky-600 text-white px-3 py-1 text-sm font-medium rounded hover:bg-sky-700 transition-colors">
                Chat Now
              </button>
            </Link>
          </div>

          {/* Quiz Card */}
          <div className="flex flex-col items-center rounded-xl bg-gray-50 shadow-md p-4 hover:shadow-lg transition-all duration-200 border-t-2 border-sky-500">
            <div className="bg-sky-100 p-2 rounded-full mb-2">
              <FaQuestionCircle className="w-6 h-6 text-sky-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">Quiz</h4>
            <Link to="/cybersecurity-quiz">
              <button className="bg-sky-600 text-white px-3 py-1 text-sm font-medium rounded hover:bg-sky-700 transition-colors">
                Take Quiz
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
