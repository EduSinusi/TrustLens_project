import React from "react";
import Hero from "../component/HomePage/Hero";
import OverviewCard from "../component/HomePage/OverviewCard";
import DialogflowMessenger from "../component/HomePage/DialogFlowMessenger";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      <Hero />
      <OverviewCard />
      <DialogflowMessenger />
    </div>
  );
};

export default HomePage;
