import React, { useState } from "react";
import Lottie from "lottie-react";
import animationCybersecurityCourse from "../../src/assets/Animation - cybersecurity course.json";
import BeginnerCourses from "../component/CybersecurityCourses/Beginner";
import IntermediateCourses from "../component/CybersecurityCourses/Intermediate";
import ExpertCourses from "../component/CybersecurityCourses/Expert";

const CybersecurityCourses = () => {
  const [activeTab, setActiveTab] = useState("Beginner");

  const tabs = [
    { id: "Beginner", label: "Beginner" },
    { id: "Intermediate", label: "Intermediate" },
    { id: "Expert", label: "Expert" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Beginner":
        return <BeginnerCourses />;
      case "Intermediate":
        return <IntermediateCourses />;
      case "Expert":
        return <ExpertCourses />;
      default:
        return <BeginnerCourses />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center mb-5" style={{ minHeight: "240px" }}>
        <Lottie
          animationData={animationCybersecurityCourse}
          loop={true}
          style={{ width: 300, height: 240, marginRight: 30 }}
        />
        <h1 className="text-7xl font-extrabold bg-gray-700 text-transparent bg-clip-text leading-tight">
          Cybersecurity Courses
        </h1>
      </div>
      <p className="mb-8 text-lg text-gray-600">
        Discover top-rated cybersecurity courses tailored to your skill level.
        Click on the tabs to explore!
      </p>

      {/* Tab Navigation */}
      <div className="flex space-x-6 mb-8 border-b border-gray-200 relative">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 font-semibold text-lg transition-all duration-300 ${
              activeTab === tab.id
                ? "text-blue-700"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-t-md"></span>
            )}
          </button>
        ))}
      </div>

      {/* Course Content */}
      <div className="min-h-[500px] animate-fade-in">{renderContent()}</div>

      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CybersecurityCourses;