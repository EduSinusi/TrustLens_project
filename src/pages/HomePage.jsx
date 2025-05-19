import React from "react";
import Hero from "../component/HomePage/Hero";
import OverviewCard from "../component/HomePage/OverviewCard";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      <Hero />
      <OverviewCard />
    </div>
  );
};

export default HomePage;
