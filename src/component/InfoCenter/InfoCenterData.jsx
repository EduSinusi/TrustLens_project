import React from "react";

export default {
  "Educational Articles & Guides": [
    {
      title: "Stay Safe from Phishing",
      tip: "Always check the sender’s email address before clicking links or sharing info.",
      Component: () => (
        <>
          <p>
            Phishing emails try to trick you into sharing personal info. Watch
            out for:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Urgent messages like “Your account is at risk!”</li>
            <li>
              Fake website links (e.g., <code>paypa1.com</code> instead of{" "}
              <code>paypal.com</code>)
            </li>
            <li>Links that don’t match the text (hover to see the real URL)</li>
            <li>Unexpected files or requests for passwords</li>
          </ul>
          <p className="mt-3">
            <strong>Tip:</strong> Contact the company directly to verify
            suspicious emails.
          </p>
          <p>
            <a
              href="https://www.phishing.org/what-is-phishing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              Learn More »
            </a>
          </p>
        </>
      ),
    },
    {
      title: "Browse the Web Safely",
      tip: "Use HTTPS websites (look for the padlock) to keep your data secure.",
      Component: () => (
        <>
          <p>Stay safe online with these easy habits:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Choose websites with a padlock (HTTPS).</li>
            <li>Turn off auto-fill for passwords on banking sites.</li>
            <li>Use tools like uBlock Origin to block trackers.</li>
            <li>Clear cookies often to avoid tracking.</li>
          </ul>
          <p className="mt-3">
            <strong>Pro Tip:</strong> Try incognito mode to browse without
            saving history.
          </p>
        </>
      ),
    },
    {
      title: "Strong Passwords & Extra Security",
      tip: "Use a password manager to create and store strong, unique passwords.",
      Component: () => (
        <>
          <p>Great passwords and extra security keep you safe:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Use 12+ characters with letters, numbers, and symbols.</li>
            <li>
              Don’t reuse passwords—try a password manager like Bitwarden.
            </li>
            <li>Turn on two-factor authentication (e.g., app codes or SMS).</li>
            <li>Update passwords every 6 months or after a hack.</li>
          </ul>
          <p className="mt-3">
            <strong>Fact:</strong> Weak passwords cause 81% of data breaches
            (Verizon 2024).
          </p>
        </>
      ),
    },
    {
      title: "Spot Dangerous Links",
      tip: "Hover over links to check their destination before clicking.",
      Component: () => (
        <>
          <p>Bad links can lead to scams or viruses. Look for:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              Short links (e.g., <code>bit.ly/xyz</code>)—check them with a URL
              expander.
            </li>
            <li>
              Weird domains (e.g., <code>go0gle.com</code> instead of{" "}
              <code>google.com</code>).
            </li>
            <li>HTTP instead of HTTPS (no padlock).</li>
            <li>
              Strange subdomains (e.g., <code>login.google.secure123.com</code>
              ).
            </li>
          </ul>
          <p className="mt-3">
            <strong>Tip:</strong> Scan links with VirusTotal before clicking.
          </p>
        </>
      ),
    },
    {
      title: "Avoid Social Engineering Tricks",
      tip: "Never share sensitive info without verifying the person’s identity.",
      Component: () => (
        <>
          <p>Scammers use tricks to fool you into sharing info:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              <strong>Pretexting:</strong> Fake stories (e.g., “I’m from IT,
              give me your password”).
            </li>
            <li>
              <strong>Baiting:</strong> Fake rewards like free software with
              viruses.
            </li>
            <li>
              <strong>Social Media Scams:</strong> Fake friend requests or
              messages.
            </li>
          </ul>
          <p className="mt-3">
            <strong>Action:</strong> Always verify through official channels
            first.
          </p>
        </>
      ),
    },
    {
      title: "Use Public Wi-Fi Safely",
      tip: "Use a VPN on public Wi-Fi to protect your data.",
      Component: () => (
        <>
          <p>Public Wi-Fi can be risky. Here’s how to stay safe:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Use a VPN (e.g., NordVPN) to encrypt your connection.</li>
            <li>Turn off sharing options (e.g., file sharing, AirDrop).</li>
            <li>Avoid banking or sensitive logins on public Wi-Fi.</li>
            <li>Stop your device from auto-connecting to Wi-Fi.</li>
          </ul>
          <p className="mt-3">
            <strong>Alternative:</strong> Use mobile data for sensitive tasks.
          </p>
        </>
      ),
    },
    {
      title: "Keep Your Browser & Device Safe",
      tip: "Update your browser and device regularly to stay secure.",
      Component: () => (
        <>
          <p>Secure your devices and browsers with these steps:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Turn on automatic updates for your system and browser.</li>
            <li>Use trusted antivirus tools like Bitdefender.</li>
            <li>Block pop-ups and trackers in browser settings.</li>
            <li>Use a firewall to watch network traffic.</li>
          </ul>
          <p className="mt-3">
            <strong>Tip:</strong> Check your router for firmware updates
            regularly.
          </p>
        </>
      ),
    },
  ],
  "Incident Reporting & Response": [
    {
      title: "Report a Cyber Incident",
      tip: "Report cyber incidents to your local CERT right away to limit damage.",
      Component: () => (
        <>
          <p>Contact your local CERT to report cyber issues:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              <a
                href="https://www.mycert.org.my"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                CERT Malaysia
              </a>{" "}
              (Hotline: +60-1-300-88-2999)
            </li>
            <li>
              <a
                href="https://www.us-cert.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:underline"
              >
                US-CERT
              </a>{" "}
              (US users)
            </li>
          </ul>
          <p className="mt-3">
            <strong>Emergency Email:</strong>{" "}
            <a
              href="mailto:cyber999@cybersecurity.gov.my"
              className="text-indigo-500 hover:underline"
            >
              cyber999@cybersecurity.gov.my
            </a>{" "}
            (Malaysia, 24/7).
          </p>
        </>
      ),
    },
    {
      title: "How to Report an Incident",
      tip: "Gather screenshots and URLs before reporting a cyber incident.",
      Component: () => (
        <>
          <p>Steps to report a cyber incident:</p>
          <ol className="list-decimal pl-5 mt-2">
            <li>Collect evidence like screenshots or URLs.</li>
            <li>Visit your local CERT website (see above).</li>
            <li>Fill out the incident report form.</li>
            <li>Submit evidence and save your report details.</li>
            <li>Check with the CERT for updates.</li>
          </ol>
          <p className="mt-3">
            <strong>Note:</strong> Act fast to reduce harm.
          </p>
        </>
      ),
    },
  ],
  "News & Alerts": [
    {
      title: "Latest Threat Alerts",
      tip: "Update your browser to avoid zero-day exploits.",
      Component: () => (
        <>
          <p>Recent Threats (as of May 2025):</p>
          <ul className="list-disc pl-5 mt-2">
            <li>SMS phishing targeting bank users (reported May 18, 2025).</li>
            <li>
              Zero-day flaw in Chromium browsers—update to version
              124.0.6367.91.
            </li>
          </ul>
          <p className="mt-3">
            <a
              href="https://www.ncsc.gov.uk/section/information-for/individuals-families"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              See Latest Alerts »
            </a>
          </p>
        </>
      ),
    },
    {
      title: "Current Scams to Avoid",
      tip: "Ignore fake delivery texts claiming missed packages.",
      Component: () => (
        <>
          <p>Trending Scams:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Fake delivery texts about missed packages.</li>
            <li>Scam calls pretending to be Microsoft support.</li>
          </ul>
          <p className="mt-3">
            <strong>Action:</strong> Report scams to your local CERT.
          </p>
        </>
      ),
    },
  ],
  "Interactive Tools & Downloads": [
    {
      title: "Safe-Browsing Checklist (PDF)",
      tip: "Download our checklist to browse safely.",
      Component: () => (
        <p>
          <a
            href="/downloads/safe_browsing_checklist.pdf"
            download
            className="text-indigo-500 hover:underline"
          >
            Download PDF »
          </a>{" "}
          (Updated May 2025)
        </p>
      ),
    },
    {
      title: "Link Hover Preview Tip",
      tip: "Use a browser extension to preview links safely.",
      Component: () => (
        <>
          <p>Hover over links to see where they go:</p>
          <p className="mt-1">
            Example:{" "}
            <a
              href="https://example.com"
              className="text-indigo-500 hover:underline"
            >
              Try hovering here
            </a>
          </p>
          <p className="mt-3">
            <strong>Tip:</strong> Use extensions like Linkclump for quick link
            previews.
          </p>
        </>
      ),
    },
  ],
  "Frequently Asked Questions (FAQs)": [
    {
      title: "Common Questions",
      tip: "Enable notifications in settings to stay updated on alerts.",
      Component: () => (
        <>
          <p>
            <strong>Q:</strong> Why is a site blocked by TrustLens?
          </p>
          <p>
            <strong>A:</strong> It might be flagged as unsafe. Contact support
            to check or appeal.
          </p>
          <p className="mt-3">
            <strong>Q:</strong> How do I get alert notifications?
          </p>
          <p>
            <strong>A:</strong> Go to Settings Notifications and turn them on.
          </p>
        </>
      ),
    },
    {
      title: "Fixing Issues",
      tip: "Clear your browser cache if TrustLens blocks a safe site.",
      Component: () => (
        <>
          <p>
            <strong>Issue:</strong> Safe site blocked by mistake
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>Clear browser cache and cookies.</li>
            <li>Report the issue via the Support page.</li>
            <li>Check for conflicting browser extensions.</li>
          </ul>
        </>
      ),
    },
  ],
  "Glossary & Cheat Sheet": [
    {
      title: "Cybersecurity Terms",
      tip: "Sort the table by term or category to quickly find cybersecurity definitions.",
      Component: () => {
        const [sortConfig, setSortConfig] = React.useState({
          key: "term",
          direction: "asc",
        });

        const glossaryData = [
          {
            term: "CAA",
            definition:
              "Certificate Authority Authorization—controls which services can issue SSL certificates for a domain.",
            category: "DNS Security",
          },
          {
            term: "DNSSEC",
            definition:
              "Protects against fake website addresses by verifying DNS data.",
            category: "DNS Security",
          },
          {
            term: "GeoIP",
            definition:
              "Identifies the location (city, country, ISP) of an IP address.",
            category: "Network Analysis",
          },
          {
            term: "HSTS",
            definition:
              "Forces websites to use secure HTTPS connections, preventing unencrypted access.",
            category: "Web Security",
          },
          {
            term: "MFA",
            definition:
              "Multi-Factor Authentication—adds extra steps like a phone code for secure logins.",
            category: "Authentication",
          },
          {
            term: "MITM",
            definition:
              "Man-in-the-Middle—when someone intercepts your online communication.",
            category: "Threats",
          },
          {
            term: "MX Records",
            definition:
              "Directs emails to the correct mail servers for a domain.",
            category: "Email Security",
          },
          {
            term: "PTR",
            definition:
              "Reverse DNS record—links an IP address back to a domain name for verification.",
            category: "DNS Security",
          },
          {
            term: "SPF/DKIM/DMARC",
            definition:
              "Email security tools to stop fake emails and verify senders.",
            category: "Email Security",
          },
          {
            term: "TLS",
            definition:
              "Transport Layer Security—encrypts data between your device and websites (e.g., HTTPS).",
            category: "Web Security",
          },
          {
            term: "Zero-Day",
            definition: "A software flaw attacked before it’s fixed.",
            category: "Threats",
          },
        ];

        const sortedData = React.useMemo(() => {
          const sorted = [...glossaryData];
          sorted.sort((a, b) => {
            const aValue = a[sortConfig.key].toLowerCase();
            const bValue = b[sortConfig.key].toLowerCase();
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
          });
          return sorted;
        }, [sortConfig]);

        const handleSort = (key) => {
          setSortConfig((prev) => ({
            key,
            direction:
              prev.key === key && prev.direction === "asc" ? "desc" : "asc",
          }));
        };

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white/80 backdrop-blur-lg rounded-xl shadow-md border border-teal-100/30">
              <thead>
                <tr className="bg-teal-100/30 text-teal-900">
                  <th
                    className="p-4 font-semibold cursor-pointer hover:bg-teal-200/50 transition-colors duration-200"
                    onClick={() => handleSort("term")}
                  >
                    Term{" "}
                    {sortConfig.key === "term" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-4 font-semibold">Definition</th>
                  <th
                    className="p-4 font-semibold cursor-pointer hover:bg-teal-200/50 transition-colors duration-200"
                    onClick={() => handleSort("category")}
                  >
                    Category{" "}
                    {sortConfig.key === "category" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-b border-teal-100/20 hover:bg-teal-50/20 transition-colors duration-200"
                  >
                    <td className="p-4 font-semibold text-gray-900">
                      {entry.term}
                    </td>
                    <td className="p-4 text-gray-800">{entry.definition}</td>
                    <td className="p-4 text-gray-700">{entry.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
    },
  ],
};
