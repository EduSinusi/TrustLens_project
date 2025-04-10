// OverviewCard.jsx
import React from "react";

const OverviewCard = () => {
  return (
    <section className="py-10 px-3 pt-6 ">
      <div className="max-w-6xl mx-auto bg-gradient-to-b from-sky-200 to-blue-100 rounded-lg shadow-md p-6">
        <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          Why do we develop TrustLens System?
        </h3>
        <p className="text-gray-600 font-semibold text-lg">
          We created TrustLens to empower users with an instant, reliable
          solution for identifying online security risks. In a world where cyber
          threats such as phishing and malware are constantly evolving,
          TrustLens combines cutting-edge technology and real-time scanning to
          detect malicious content and ensure safe browsing. It provides users
          with the peace of mind that they need to surf the web confidently.
        </p>
      </div>
    </section>
  );
};

export default OverviewCard;
