import React from "react";
import PropTypes from "prop-types";
import { FaCircleInfo } from "react-icons/fa6";

const infoDescriptions = {
  VirusTotal:
    "VirusTotal aggregates antivirus scans and URL analysis from multiple engines to detect malicious content.",
  "TrustLens Domain Security Check":
    "TrustLens Domain Security Check evaluates the safety of a domain by analyzing DNS records, IP addresses, domain age, and various security checks to identify potential risks.",
  "Domain Name":
    "The Domain Name identifies the unique address of the website, used to access it on the internet.",
  "DNS Resolution Result":
    "DNS Resolution Result indicates whether the domain can be resolved to an IP address. Non-existent domains suggest typos or unregistered domains.",
  "IPv4 Address":
    "IPv4 Address is the primary numerical address used to locate the server hosting the domain on the internet.",
  "IPv6 Addresses":
    "IPv6 Addresses are next-generation addresses that provide greater capacity and compatibility for modern internet protocols.",
  "Domain Age":
    "Domain Age reflects how long the domain has been registered. Older domains are often more trustworthy, while newer ones may require caution.",
  "Risk Summary":
    "Risk Summary categorizes potential issues into Critical, High, Medium, and Low risks, summarizing the severity of detected security concerns.",
  "Security Score":
    "Security Score is a numerical assessment (0-100) of the domain’s safety, based on DNS, IP, and security check results.",
  "DNS Resolution":
    "DNS Resolution checks if the domain resolves to valid IP addresses, ensuring it exists and is accessible.",
  "GeoIP Location":
    "GeoIP Location identifies the geographical location of the server hosting the domain, which can indicate potential risks if mismatched.",
  "Email Security":
    "Email Security evaluates configurations like SPF, DKIM, and DMARC to prevent email spoofing and phishing attacks.",
  "SSL/TLS Configuration":
    "SSL/TLS Configuration checks the domain’s encryption setup to ensure secure data transmission.",
  "Known Malware":
    "Known Malware scans for any history of malicious software associated with the domain.",
  "Blacklist Check":
    "Blacklist Check verifies if the domain is listed on known blocklists for malicious or suspicious activity.",
  "DNSSEC":
    "DNSSEC (Domain Name System Security Extensions) ensures DNS data integrity by preventing DNS spoofing. Lack of DNSSEC makes the domain vulnerable to attacks.",
  "Reverse DNS":
    "Reverse DNS checks if the domain’s IP address resolves back to the domain name via a PTR record, ensuring proper configuration and trustworthiness.",
  "MX Records":
    "MX Records specify the mail servers responsible for receiving email. Missing MX records may indicate no email service or reduce phishing risk if intentional.",
  "IPv6 Support":
    "IPv6 Support checks if the domain supports IPv6 addresses, ensuring compatibility with modern internet protocols.",
  "TLS Versions":
    "TLS Versions checks the supported Transport Layer Security versions for encrypted communication. Modern versions like TLS 1.3 are more secure.",
  "HTTP/HTTPS Availability":
    "HTTP/HTTPS Availability verifies if the domain supports secure HTTPS connections and checks for HSTS to enforce secure browsing.",
  "Blacklist Status":
    "Blacklist Status checks if the domain or its IP is listed on known blacklists, indicating potential malicious activity or poor reputation.",
  "Subdomain Enumeration":
    "Subdomain Enumeration identifies active subdomains, which may pose security risks if not properly secured or monitored.",
  "CAA Records":
    "CAA Records (Certification Authority Authorization) specify which Certificate Authorities can issue certificates for the domain, enhancing security.",
};

const InfoBubble = ({ apiName }) => {
  return (
    <div className="relative group inline-block">
      {/* FaCircleInfo Icon */}
      <FaCircleInfo
        className="h-[11px] w-[11px] opacity-70 ml-1 mb-1 text-blue-700 cursor-pointer hover:text-blue-600 transition-colors"
        aria-label={`More information about ${apiName}`}
      />

      {/* Info Bubble */}
      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 w-65 top-0 left-6 z-50 shadow-lg">
        <h3 className="font-semibold text-sm">{apiName}</h3>
        <p className="text-xs">
          {infoDescriptions[apiName] || "No description available."}
        </p>
      </div>
    </div>
  );
};

InfoBubble.propTypes = {
  apiName: PropTypes.string.isRequired,
};

export default InfoBubble;