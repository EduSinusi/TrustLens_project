import React from "react";
import InfoCenterContent from "../component/InfoCenter/InfoCenterContent";

export default function InfoCenterPage() {
  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-8 font-poppins">
      <div className="w-full max-w-6xl bg-white backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-teal-200/30">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center bg-gray-700 text-transparent bg-clip-text">
          TrustLens Cybersecurity Info Center
        </h1>
        <p className="text-gray-700 mb-8 text-center text-lg leading-relaxed">
          Discover expertly curated guides, tools, and resources to enhance your online safety.
        </p>
        <InfoCenterContent />
      </div>
    </div>
  );
}