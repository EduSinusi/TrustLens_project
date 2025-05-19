import React, { useState, useMemo } from "react";
import contentData from "./InfoCenterData";

export default function InfoCenterContent() {
  const [openSections, setOpenSections] = useState({});

  const toggle = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const sections = useMemo(() => Object.entries(contentData), []);

  return (
    <div className="space-y-5 text-base text-gray-800 font-poppins">
      {sections.map(([heading, articles]) => (
        <section key={heading} className="border-b border-teal-200/20">
          <button
            onClick={() => toggle(heading)}
            aria-expanded={!!openSections[heading]}
            className="flex justify-between items-center w-full p-4 bg-sky-200/25 backdrop-blur-md rounded-xl hover:bg-sky-200/60 focus:outline-none transition-all duration-300 ease-in-out group"
          >
            <span className="font-semibold text-sky-900 text-lg">
              {heading}
            </span>
            <svg
              className={`w-6 h-6 transform transition-transform duration-300 ${
                openSections[heading] ? "rotate-180" : ""
              } group-hover:text-teal-600`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {openSections[heading] && (
            <div className="mt-4 pl-6 space-y-4">
              {articles.map(({ title, Component }, idx) => (
                <article
                  key={idx}
                  className="p-4 bg-white/30 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-teal-100/20"
                >
                  <h4 className="font-bold text-gray-900 mb-2 text-base">
                    {title}
                  </h4>
                  <Component />
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}