import React, { useState, useMemo } from "react";
import contentData from "./InfoCenterData";

export default function InfoCenterContent() {
  const [openSections, setOpenSections] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return Object.entries(contentData);

    const query = searchQuery.toLowerCase();
    return Object.entries(contentData).reduce((acc, [heading, articles]) => {
      const filteredArticles = articles.filter(
        ({ title }) => title.toLowerCase().includes(query) || heading.toLowerCase().includes(query)
      );
      if (filteredArticles.length > 0 || heading.toLowerCase().includes(query)) {
        acc.push([heading, filteredArticles]);
      }
      return acc;
    }, []);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search for tips, guides, or tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 pr-12 text-gray-800 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-400 text-lg"
        />
        <svg
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {filteredSections.length === 0 && (
        <p className="text-center text-gray-600 text-lg">No results found. Try a different search term!</p>
      )}
      <div className="space-y-5 text-base text-gray-800">
        {filteredSections.map(([heading, articles]) => (
          <section key={heading} className="border-b border-teal-200/20">
            <button
              onClick={() => toggle(heading)}
              aria-expanded={!!openSections[heading]}
              className="flex justify-between items-center w-full p-5 bg-sky-200/70 backdrop-blur-md rounded-2xl hover:bg-sky-300/50 focus:outline-none transition-all duration-300 ease-in-out group"
            >
              <span className="font-semibold text-teal-900 text-xl">
                {heading}
              </span>
              <svg
                className={`w-7 h-7 transform transition-transform duration-300 text-teal-600 ${
                  openSections[heading] ? "rotate-180" : ""
                } group-hover:text-teal-700`}
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
              <div className="mt-4 pl-6 space-y-4 animate-fadeIn">
                {articles.map(({ title, Component }, idx) => (
                  <article
                    key={idx}
                    className="p-5 bg-white/50 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-teal-100/30"
                  >
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">
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
    </div>
  );
}