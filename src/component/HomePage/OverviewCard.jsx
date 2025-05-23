import React from "react";
import { Link } from "react-router-dom";

const OverviewCard = () => {
  return (
    <section className="pt-5 pb-15 px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 transform transition-all duration-500">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 animate-fade-in-down">
          Why TrustLens?
        </h3>
        <ul className="text-gray-600 text-lg md:text-xl leading-relaxed mb-2 list-disc pl-6 space-y-2 animate-fade-in-up">
          <li>
            <strong>Real-time URL scanning</strong> - Instantly check the safety of any website before you visit.
          </li>
          <li>
            <strong>Flexible input options</strong> - Scan URLs via webcam, image upload, or manual entry for maximum convenience.
          </li>
          <li>
            <strong>Advanced OCR technology</strong> - Accurately extracts website addresses from images and screens.
          </li>
          <li>
            <strong>Threat intelligence integration</strong> - Detects and blocks phishing, malware, and other cyber risks automatically.
          </li>
          <li>
            <strong>Immediate notifications</strong> - Get real-time alerts when threats are found, keeping you informed and secure.
          </li>
          <li>
            <strong>Scan history dashboard</strong> - Easily review your previous scans and track your digital safety over time.
          </li>
          <li>
            <strong>Interactive cybersecurity resources</strong> - Access an AI-powered chatbot assistant and take educational quizzes to boost your online security awareness.
          </li>
          <li>
            <strong>Seamless, user-friendly experience</strong> - Enjoy a simple, intuitive interface designed for both beginners and advanced users.
          </li>
        </ul>
        {/* Optional: Add a call-to-action button */}
        {/* <Link to="/get-started" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition">Get Started</Link> */}
      </div>
    </section>
  );
};

export default OverviewCard;
