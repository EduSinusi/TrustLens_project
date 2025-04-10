// SidebarItem.jsx
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarContext } from "./Sidebar";

const SidebarItem = ({ icon, text, to }) => {
  const { expanded } = useContext(SidebarContext);
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <li>
      <Link
        to={to}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex items-center justify-start py-2 px-4 my-3 font-medium text-xl rounded-md cursor-pointer transition-colors group ${
          active
            ? "bg-gradient-to-tr from-blue-300 to-blue-100 text-blue-800"
            : "text-gray-600 hover:bg-blue-200"
        }`}
      >
        {/* Icon with conditional color */}
        <div
          className={`w-8 h-8 ${
            active ? "text-blue-800" : "text-gray-700 group-hover:text-blue-600"
          } transition-colors duration-300`}
        >
          {icon}
        </div>
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          } ${active ? "text-blue-800" : "text-sky-950"}`}
        >
          {text}
        </span>

        {/* Floating label when sidebar is collapsed */}
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
            aria-hidden={!expanded && !active}
          >
            {text}
          </div>
        )}
      </Link>
    </li>
  );
};

export default SidebarItem;
