// HomeCards.jsx
import React from "react";
import { Link } from "react-router-dom";

const HomeCards = () => {
  return (
    <section className="justify-center flex px-12 py-10">
      <div className="max-w-[85%] mx-auto flex md:flex-row gap-45">
        {/* Start Your Scan Now Card */}
        <div className="flex items-center rounded-4xl bg-gradient-to-b from-sky-500 to-sky-50  shadow-md p-4">
          <img src="./camera-icon.png" className="w-35 h-35 mr-6 ml-2" />
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-3xl font-semibold mb-5 text-gray-800">
              Start Scanning Now
            </h3>
            <Link to="/url-scan/webcam">
              <button className="bg-sky-600 text-white text-2xl px-6 py-2 font-semibold rounded-xl hover:bg-slate-400 transition-colors">
                Scan URL
              </button>
            </Link>
          </div>
        </div>

        {/* Analyse Scan History Card */}

        <div className="flex items-center rounded-4xl shadow-md p-4 bg-gradient-to-b from-sky-500 to-sky-50 ">
          <img src="./computer-dashboard.png" className="w-35 h-35 mr-6" />
          <div className="flex flex-col items-center justify-center ">
            <h3 className="text-3xl font-semibold mb-4 text-gray-800">
              Analyse Scan History
            </h3>
            <Link to="/dashboard">
              <button className="flex-wrap bg-sky-600 text-white w-40 mb-1.5 p-1.5 font-semibold rounded-xl hover:bg-slate-400 transition-colors">
                Dashboard
              </button>
            </Link>
            <Link to="/scan-history">
              <button className="bg-sky-600 text-white w-40 p-1.5 font-semibold rounded-xl hover:bg-slate-400 transition-colors">
                View Scan History
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;
