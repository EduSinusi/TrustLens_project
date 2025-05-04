import React from "react";
import PropTypes from "prop-types";
import { FaMagic } from "react-icons/fa";

const GeminiSummarySection = ({ gemini_summary }) => {
  if (!gemini_summary) return null;

  return (
    <div className="relative bg-gradient-to-br from-violet-50 to-purple-100 border border-purple-300 rounded-xl p-4 mt-2 shadow-md">
      <div className="flex items-center mb-2">
        <FaMagic className="text-purple-600 mr-2" />
        <h3 className="font-semibold text-lg text-purple-700">
          AI Summary (Gemini)
        </h3>
      </div>
      <p
        className={`text-[16px] leading-relaxed ${
          gemini_summary.startsWith("Error") ? "text-red-600" : "text-gray-800"
        }`}
      >
        {gemini_summary}
      </p>
      <div className="absolute top-2 right-4 flex items-center space-x-1">
        <span className="text-xs text-purple-500 font-medium italic mr-2 mt-1.5">
          Powered by
        </span>
        <img
          src="/Google_Gemini_logo.png"
          alt="Gemini Logo"
          className="w-12 h-auto"
        />
      </div>
    </div>
  );
};

GeminiSummarySection.propTypes = {
  gemini_summary: PropTypes.string,
};

export default GeminiSummarySection;
