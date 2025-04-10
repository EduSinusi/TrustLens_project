// HeroSection.jsx
import React from "react";
import HomeCards from "./HomeCards";

const HeroSection = () => {
  return (
    <>
      <section className="h-100 bg-gradient-to-b from-sky-600 to-gray-200 flex items-center justify-center shadow-xl rounded-b-xl">
        {/* Hero Heading and Subheading */}
        <div className="text-center">
          <h1
            className="text-[65px] font-bold text-slate-800 mb-4 opacity-[85%]"
            style={{ textShadow: "2px 3px 5px rgba(0, 0, 0, 0.5)" }}
          >
            Scan URLs for Security Risks Instantly
          </h1>
          <p className="text-2xl font-semibold text-gray-600 mb-8">
            Detect threats, improve performance, and enhance security in
            real-time with our powerful OCR tool.
          </p>
        </div>
      </section>

      <HomeCards />

      {/* 4 Steps to Use TrustLens */}
      <div className="flex p-10 pb-1 my-5 max-w-6xl mx-auto">
        <img
          src="./icon-security-lock.png"
          alt="Security Lock Icon"
          className="w-70 h-75 mr-20"
        />

        <ol className="space-y-4 text-gray-700 text-2xl">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6">
            4 Simple Steps to Use TrustLens:
          </h2>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2.5">1.</span>
            <h3 className="">Ensure external camera is properly connected.</h3>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2.5">2.</span>
            Point the camera to the URL you wish to analyze.
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2.5">3.</span>
            Wait for detected link to process.
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2.5">4.</span>
            Receive scan result as push notification on your phone.
          </li>
        </ol>
      </div>
    </>
  );
};

export default HeroSection;
