import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";

const ExpertCourses = () => {
  const courses = [
    {
      title: "Certified Information Systems Security Professional (CISSP)",
      description:
        "A senior-level certification testing expertise in security architecture, risk management, and cryptography for experienced professionals.",
      link: "https://www.isc2.org/Certifications/CISSP",
      difficulty: 5,
      duration: "3-6 months (self-paced)",
      platform: "ISC2",
    },
    {
      title: "Offensive Security Certified Professional (OSCP)",
      description:
        "An advanced, hands-on certification focused on penetration testing and ethical hacking, ideal for offensive security roles.",
      link: "https://www.offensive-security.com/oscp/",
      difficulty: 5,
      duration: "3-6 months (intensive)",
      platform: "Offensive Security",
    },
    {
      title: "Certified in Risk and Information Systems Control (CRISC)",
      description:
        "Targets expert-level risk management and governance, enhancing business resilience with a focus on IT security.",
      link: "https://www.isaca.org/credentialing/crisc",
      difficulty: 5,
      duration: "3-4 months (self-paced)",
      platform: "ISACA",
    },
    {
      title: "SANS SEC560: Enterprise Penetration Testing",
      description:
        "An expert-level course on advanced penetration testing, red teaming, and exploit development for seasoned security professionals.",
      link: "https://www.sans.org/cyber-security-courses/enterprise-penetration-testing/",
      difficulty: 5,
      duration: "6 days (intensive)",
      platform: "SANS Institute",
    },
    {
      title: "Certified Information Security Manager (CISM)",
      description:
        "Focuses on security management, governance, and program development for IT leaders with extensive experience.",
      link: "https://www.isaca.org/credentialing/cism",
      difficulty: 5,
      duration: "3-6 months (self-paced)",
      platform: "ISACA",
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

export default ExpertCourses;
