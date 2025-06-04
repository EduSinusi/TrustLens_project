import React from "react";
import InfoCenterContent from "../component/InfoCenter/InfoCenterContent";
import TipOfTheDay from "../component/InfoCenter/TipOfTheDay";

export default function InfoCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200/50 to-gray-100 flex flex-col items-center justify-start p-6 font-poppins">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-10 border border-teal-300/20 mt-8">
        <h1 className="text-6xl font-extrabold bg-gray-700 text-transparent text-center bg-clip-text leading-tight">
          TrustLens Cybersecurity Hub
        </h1>
        <p className="text-gray-600 mb-8 text-center text-2xl leading-relaxed max-w-3xl mx-auto">
          Explore simple, practical guides and tools to stay safe online!
        </p>
        <TipOfTheDay />
        <InfoCenterContent />
      </div>
    </div>
  );
}