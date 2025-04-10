import React, { useState } from "react";
import Header from "../component/Layout/Header/Header";
import Sidebar from "../component/Layout/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [expanded, setExpanded] = useState(false); // Move state to MainLayout

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      {/* Main Content */}
      <div className="flex1 flex flex-col w-full">
        <Header />
        <main className={`flex-1 overflow-auto transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
