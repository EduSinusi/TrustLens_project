import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

const IntermediateCourses = () => {
  const courses = [
    {
      title: "ISC2 Certified in Cybersecurity (CC)",
      description:
        "An intermediate credential for designing and monitoring secure IT infrastructure, covering access controls and incident response.",
      link: "https://www.isc2.org/Certifications/CC",
      difficulty: 3,
      duration: "3 months (self-paced)",
      platform: "ISC2",
    },
    {
      title: "CompTIA Cybersecurity Analyst (CySA+)",
      description:
        "Focuses on threat detection, incident response, and vulnerability management, requiring some prior InfoSec experience.",
      link: "https://www.comptia.org/certifications/cybersecurity-analyst",
      difficulty: 3,
      duration: "4-6 months (self-paced)",
      platform: "CompTIA",
    },
    {
      title: "IBM Cybersecurity Analyst Professional Certificate",
      description:
        "Covers incident response, threat analysis, and security tools, designed for those with basic IT knowledge.",
      link: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst",
      difficulty: 3,
      duration: "8 months (10 hours/week)",
      platform: "Coursera",
    },
    {
      title: "SANS SEC401: Security Essentials Bootcamp Style",
      description:
        "A hands-on course teaching security fundamentals, network monitoring, and incident handling for mid-level professionals.",
      link: "https://www.sans.org/cyber-security-courses/security-essentials/",
      difficulty: 4,
      duration: "6 days (intensive)",
      platform: "SANS Institute",
    },
    {
      title: "EC-Council Certified Ethical Hacker (CEH)",
      description:
        "An intermediate course on ethical hacking techniques, penetration testing, and system vulnerabilities.",
      link: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/",
      difficulty: 4,
      duration: "5 days (intensive) or self-paced",
      platform: "EC-Council",
    },
  ];

  const handleLinkClick = (link) => {
    const confirmed = window.confirm(
      "You are about to visit an external website. Do you want to proceed?"
    );
    if (confirmed) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {courses.map((course, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {course.title}
            </h3>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">
                  Difficulty:
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < course.difficulty
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">
                  Duration:
                </span>
                <span className="text-gray-600">{course.duration}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">
                  Platform:
                </span>
                <span className="text-gray-600">{course.platform}</span>
              </div>
            </div>
            <button
              onClick={() => handleLinkClick(course.link)}
              className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-teal-500 transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntermediateCourses;
