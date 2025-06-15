import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

const BeginnerCourses = () => {
  const courses = [
    {
      title: "Google Cybersecurity Certificate",
      description:
        "A beginner-friendly course covering network security, cyber threats, and risk management, with hands-on labs and no prior experience required.",
      link: "https://www.coursera.org/professional-certificates/google-cybersecurity",
      difficulty: 1,
      duration: "6 months (10 hours/week)",
      platform: "Coursera",
    },
    {
      title: "CompTIA Security+",
      description:
        "An entry-level certification focusing on cyber attacks, architecture design, and incident control, ideal for starting a cybersecurity career.",
      link: "https://www.comptia.org/certifications/security",
      difficulty: 2,
      duration: "3-4 months (self-paced)",
      platform: "CompTIA",
    },
    {
      title: "Introduction to Cybersecurity",
      description:
        "A free course introducing cybersecurity basics, including threats and data protection techniques, suitable for beginners.",
      link: "https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity",
      difficulty: 1,
      duration: "15 hours",
      platform: "Cisco Networking Academy",
    },
    {
      title: "Cybersecurity Fundamentals",
      description:
        "Covers foundational concepts like encryption, malware, and security policies, with a self-paced learning option.",
      link: "https://www.edx.org/learn/cybersecurity/rochester-institute-of-technology-cybersecurity-fundamentals",
      difficulty: 2,
      duration: "8 weeks (3-5 hours/week)",
      platform: "edX",
    },
    {
      title: "Microsoft Technology Associate: Security Fundamentals",
      description:
        "Introduces security layers, network security, and operational procedures, perfect for IT beginners.",
      link: "https://www.microsoft.com/en-us/learning/exam-98-367.aspx",
      difficulty: 1,
      duration: "40 hours",
      platform: "Microsoft",
    },
  ];

  const handleLinkClick = (link) => {
    const confirmed = window.confirm(
      `You are about to visit an external website (${link}). Do you want to proceed?`
    );
    if (confirmed) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          alert(
            "Link copied to clipboard. Check its safety status in TrustLens Safe Search!"
          );
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
          alert("Failed to copy the link. Please copy it manually: " + link);
        });
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
                  {[...Array(3)].map((_, i) => (
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

export default BeginnerCourses;
