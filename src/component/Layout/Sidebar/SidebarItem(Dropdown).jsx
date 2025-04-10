// SidebarItemWithDropdown.jsx
import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarContext } from "./Sidebar";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";

const SidebarItemWithDropdown = ({ icon, text, items }) => {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const active = items.some((item) => location.pathname === item.to);

  // Reset selection when clicking main item
  const handleMainClick = () => {
    if (expanded) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        // When opening, deselect by navigating to parent route
        window.history.pushState({}, "", "/url-scan");
      }
    }
  };

  return (
    <li className="relative">
      {/* Main Item */}
      <div
        onClick={handleMainClick}
        className={`relative flex items-center justify-start py-2 px-4 my-3 font-medium text-xl rounded-md cursor-pointer transition-colors group ${
          active
            ? "bg-gradient-to-tr from-blue-300 to-blue-100 text-blue-800"
            : "text-gray-700 hover:bg-blue-200"
        }`}
      >
        <div
          className={`w-8 h-8 ${
            active ? "text-blue-800" : "text-gray-900 group-hover:text-blue-600"
          } transition-colors duration-300`}
        >
          {icon}{" "}
        </div>
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-48 ml-3" : "w-0"
          } ${active ? "text-blue-800" : "text-sky-950"}`}
        >
          {text}
        </span>
        {expanded && (
          <ChevronDownIcon
            className={`w-5 h-5 ml-auto transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
        {!expanded && (
          <div
            className={`
              absolute left-full rounded-md px-3 py-1 ml-4
              bg-blue-200 text-blue-900 text-sm font-medium
              shadow-md
              invisible opacity-0 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
              z-10
            `}
          >
            {text}
          </div>
        )}
      </div>

      {/* Dropdown Items */}
      {expanded && isOpen && (
        <ul className="ml-8 mt-1 space-y-1">
          {items.map((item, index) => {
            const isSelected = location.pathname === item.to;
            const DefaultIcon =
              item.text === "Search Bar"
                ? MagnifyingGlassIcon
                : item.text === "External Webcam"
                ? VideoCameraIcon
                : item.text === "Upload Image"
                ? PhotoIcon
                : ChevronRightIcon; // Provide a default fallback icon

            return (
              <li key={index}>
                <Link
                  to={item.to}
                  className={`flex items-center py-1 px-3 text-md font-semibold rounded-md transition-colors duration-200 ${
                    isSelected
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  <span className="flex items-center w-5 h-5 mr-2 transition-all duration-300">
                    {isSelected ? (
                      <ChevronRightIcon className="w-5 h-5 opacity-100" />
                    ) : (
                      <DefaultIcon className="w-5 h-5 opacity-100" />
                    )}
                  </span>
                  {item.text}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default SidebarItemWithDropdown;
