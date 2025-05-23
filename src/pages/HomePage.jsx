import React from "react";
import Hero from "../component/HomePage/Hero";
import OverviewCard from "../component/HomePage/OverviewCard";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <Hero />
      <OverviewCard />
    </div>
  );
};

export default HomePage;