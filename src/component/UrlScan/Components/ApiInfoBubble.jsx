import React from "react";
import PropTypes from "prop-types";

// Import API logos (you'll need to provide these images)
import googleSafeBrowsingLogo from "/google-logo.png"; // Replace with actual path
import virusTotalLogo from "/virustotal.svg"; // Replace with actual path
import whoisLogo from "/whois-logo.png"; // Replace with actual path
import infoIcon from "/info-logo.png"; // Replace with your custom info icon path

const apiLogos = {
  "Google Safe Browsing": googleSafeBrowsingLogo,
  VirusTotal: virusTotalLogo,
  "WHOIS Database": whoisLogo,
};

const apiDescriptions = {
  VirusTotal:
    "VirusTotal aggregates antivirus scans and URL analysis from multiple engines to detect malicious content.",
};

const ApiInfoBubble = ({ apiName }) => {
  return (
    <div className="relative group inline-block">
      {/* Custom Info Icon */}
      <img
        src={infoIcon}
        alt="Info"
        className="h-[11px] w-[10px] ml-1 mb-1 cursor-pointer"
        aria-label={`More information about ${apiName}`}
      />

      {/* Info Bubble */}
      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 w-90 top-0 left-6 z-50 shadow-lg">
        <div className="flex items-start gap-3">
          {/* API Logo on the Left */}
          <img
            src={apiLogos[apiName]}
            alt={`${apiName} Logo`}
            className="h-8 w-8 object-contain"
          />
          {/* API Name and Description on the Right */}
          <div>
            <h3 className="font-semibold text-sm">{apiName}</h3>
            <p className="text-xs">{apiDescriptions[apiName]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

ApiInfoBubble.propTypes = {
  apiName: PropTypes.string.isRequired,
};

export default ApiInfoBubble;
