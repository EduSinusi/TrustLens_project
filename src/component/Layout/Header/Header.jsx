import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Greetings from "./Greetings";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  return (
    <>
      <header className="flex h-30 p-2.5 items-center justify-between bg-white shadow-md">
        <div className="flex items-center space-x-2">
          {/* Menu Icon */}

          {/* Logo and Title (Clickable) */}
          <Link to="/home" className="flex items-center space-x-2">
            <img
              src="/trustlens-logo.png"
              alt="TrustLens Logo"
              className="w-23 h-23" // Adjusted size for better fit
            />
            <h1 className="text-4xl font-bold text-sky-900">
              TrustLens System
            </h1>
          </Link>
        </div>
        <Greetings />
      </header>
    </>
  );
};

export default Header;
