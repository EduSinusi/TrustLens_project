// Sidebar.jsx
import React, { createContext } from "react";
import {
  HomeIcon,
  LinkIcon,
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { ChevronFirst, ChevronLast } from "lucide-react";
import ClickOutside from "./ClickOutside";
import SidebarItem from "./SidebarItem";
import SidebarItemWithDropdown from "./SidebarItem(Dropdown)"; // Add this import
import UserProfile from "../Sidebar/UserProfile";
import { Link } from "react-router-dom";

export const SidebarContext = createContext();

const Sidebar = ({ expanded, setExpanded }) => {
  const handleClickOutside = () => {
    if (expanded) {
      console.log("Collapsing sidebar due to click outside");
      setExpanded(false);
    }
  };

  const handleSidebarClick = (e) => {
    e.stopPropagation();
    if (!expanded) {
      console.log("Expanding sidebar due to click");
      setExpanded(true);
    }
  };

  // Define dropdown items for URL Scan
  const urlScanItems = [
    { text: "Search Bar", to: "/url-scan/search" },
    { text: "External Webcam", to: "/url-scan/webcam" },
    { text: "Upload Image", to: "/url-scan/image" },
  ];

  return (
    <ClickOutside onClickOutside={handleClickOutside}>
      <aside className="h-screen" onClick={handleSidebarClick}>
        <nav
          className={`h-full flex flex-col bg-gradient-to-b from-sky-600 to-gray-200 border-none items-center shadow-xl pt-2.5 ${
            expanded ? "w-72" : "w-20"
          } transition-all duration-300`}
        >
          <div className="p-5 pb-2 flex justify-center items-center">
            <Link to="/home">
              <img
                src="/trustlens-logo.png"
                alt="TrustLens Logo"
                className={`object-cover overflow-hidden transition-all ${
                  expanded ? "w-32 h-auto" : "w-0 h-0"
                }`}
              />
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((curr) => !curr);
              }}
              className="p-2 rounded-lg bg-gray-300 shadow-md hover:bg-gray-400"
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3">
              <SidebarItem
                icon={<HomeIcon className="w-8 h-8" />}
                text="Home"
                to="/home"
              />
              <SidebarItemWithDropdown
                icon={<LinkIcon className="w-8 h-8" />}
                text="URL Scan"
                items={urlScanItems}
              />
              <SidebarItem
                icon={<ChartBarIcon className="w-8 h-8" />}
                text="Dashboard"
                to="/dashboard"
              />
              <SidebarItem
                icon={<ClockIcon className="w-8 h-8" />}
                text="Scan History"
                to="/scan-history"
              />
              <SidebarItem
                icon={<ChatBubbleLeftIcon className="w-8 h-8" />}
                text="Support"
                to="/support"
              />
            </ul>
          </SidebarContext.Provider>
          <UserProfile expanded={expanded} />
        </nav>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
