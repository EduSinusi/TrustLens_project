import React, { useState, useEffect } from "react";
import contentData from "./InfoCenterData";

export default function TipOfTheDay() {
  const [currentTip, setCurrentTip] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tips = Object.values(contentData)
      .flat()
      .filter((item) => item.tip)
      .map((item) => item.tip);
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
  }, []);

  if (!isVisible || !currentTip) return null;

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-slideIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-[30px] font-bold mb-1">Tip of the Day!</h3>
          <p className="text-[20px] leading-relaxed">{currentTip}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-teal-200 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}