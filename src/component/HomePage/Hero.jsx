import React from "react";
import HomeCards from "./HomeCards";
import Lottie from "lottie-react";
import animationLandingPage from "../../../src/assets/Animation - hero.json";

const HeroSection = () => {
  return (
    <>
      <section className="relative h-[45vh] bg-gradient-to-b from-sky-600 to-gray-300  flex items-center justify-center overflow-hidden shadow-[0_10px_15px_-5px_rgba(0,0,0,0.3)] rounded-b-2xl mb-6">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.2)_0%,_transparent_70%)]"></div>

        {/* Hero Content */}
        <div className="text-center z-10 px-4 md:px-8">
          <h1
            className="text-5xl md:text-7xl font-extrabold text-white mb-6 opacity-90 tracking-tight animate-fade-in-down"
            style={{ textShadow: "3px 4px 8px rgba(0, 0, 0, 0.4)" }}
          >
            Scan URLs & QR Codes with TrustLens
          </h1>
          <p className="text-xl md:text-3xl font-medium text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up">
            Protect yourself from threats using three powerful methods:
            Search Bar, Live Scan, or Image Scan.
          </p>
          <p className="text-xl font-semibold text-gray-700 italic animate-fade-in-up delay-200">
            Disclaimer: This tool is only a support system.
          </p>
        </div>
      </section>

      <HomeCards />

      {/* Updated Tutorial Section */}
      <div className="flex flex-col md:flex-row items-center p-7 md:p-12 max-w-7xl mx-auto bg-white rounded-2xl shadow-lg my-1">
        <Lottie
          animationData={animationLandingPage}
          loop={true}
          style={{ width: 260, height: 260, marginRight: "2.5rem" }}
        />

        <div className="flex-1">
          <h2 className="text-4xl md:text-4xl font-bold text-gray-800 mb-8">
            How to Use TrustLens in 4 Easy Steps
          </h2>
          <ol className="space-y-4 text-gray-700 text-lg md:text-2xl">
            <li className="flex items-start">
              <span className="text-sky-600 font-bold mr-3">1.</span>
              Pick your scan method: Search Bar, Live Scan, or Image Scan.
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 font-bold mr-3">2.</span>
              Scan the URL or QR code using your chosen method.
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 font-bold mr-3">3.</span>
              Wait for TrustLens to process the detected link.
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 font-bold mr-3">4.</span>
              Receive and review the scan result.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
