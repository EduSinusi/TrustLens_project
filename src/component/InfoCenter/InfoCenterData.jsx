export default {
  "Educational Articles & Guides": [
    {
      title: "Phishing & Social Engineering",
      Component: () => (
        <>
          <p>Phishing emails often use tactics to trick users. Watch for:</p>
          <ul className="list-disc pl-5">
            <li>Urgent or threatening language (e.g., "Your account will be suspended!")</li>
            <li>Misspelled domains (e.g., <code>paypa1.com</code> instead of <code>paypal.com</code>)</li>
            <li>Mismatched link text vs. actual URL (hover to check)</li>
            <li>Unexpected attachments or requests for sensitive information</li>
          </ul>
          <p className="mt-2">
            <strong>Tip:</strong> Verify the sender via official channels before acting.
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
      title: "Safe Browsing Habits",
      Component: () => (
        <>
          <p>Protect yourself online with these habits:</p>
          <ul className="list-disc pl-5">
            <li>Always prefer <strong>HTTPS</strong> websites (look for the padlock icon).</li>
            <li>Disable auto-fill for sensitive forms (e.g., banking credentials).</li>
            <li>Use a script/content blocker like uBlock Origin or Privacy Badger.</li>
            <li>Clear cookies and cache regularly to reduce tracking.</li>
          </ul>
          <p className="mt-2">
            <strong>Pro Tip:</strong> Use incognito mode for casual browsing to avoid saving history.
          </p>
        </>
      ),
    },
    {
      title: "Password Hygiene & MFA",
      Component: () => (
        <>
          <p>Strong passwords and multi-factor authentication (MFA) are essential:</p>
          <ul className="list-disc pl-5">
            <li>Use at least 12 characters with a mix of letters, numbers, and symbols.</li>
            <li>Never reuse passwords across sites—use a password manager like LastPass or Bitwarden.</li>
            <li>Enable MFA (e.g., SMS codes, authenticator apps) for all accounts.</li>
            <li>Change passwords every 6 months or after a suspected breach.</li>
          </ul>
          <p className="mt-2">
            <strong>Did You Know?</strong> 81% of breaches involve weak or stolen passwords (Verizon DBIR 2024).
          </p>
        </>
      ),
    },
    {
      title: "Recognizing Malicious Links",
      Component: () => (
        <>
          <p>Suspicious links can lead to malware or phishing sites. Look for:</p>
          <ul className="list-disc pl-5">
            <li>Shortened URLs (e.g., <code>bit.ly/xyz</code>)—use a URL expander to check.</li>
            <li>Typosquatted domains (e.g., <code>go0gle.com</code> instead of <code>google.com</code>).</li>
            <li>HTTP instead of HTTPS—indicates an unsecured site.</li>
            <li>Unusual characters or subdomains (e.g., <code>login.google.secure123.com</code>).</li>
          </ul>
          <p className="mt-2">
            <strong>Tip:</strong> Use a link scanner like VirusTotal before clicking.
          </p>
        </>
      ),
    },
    {
      title: "Social Engineering Threats",
      Component: () => (
        <>
          <p>Social engineering manipulates users into divulging information:</p>
          <ul className="list-disc pl-5">
            <li><strong>Pretexting:</strong> Fake scenarios (e.g., "I’m from IT, I need your password").</li>
            <li><strong>Baiting:</strong> Offering fake rewards (e.g., free software with malware).</li>
            <li><strong>Phishing via Social Media:</strong> Fake friend requests or messages.</li>
          </ul>
          <p className="mt-2">
            <strong>Response:</strong> Verify identities through official channels—never share sensitive info without confirmation.
          </p>
        </>
      ),
    },
    {
      title: "Safe Use of Public Wi-Fi",
      Component: () => (
        <>
          <p>Public Wi-Fi can expose you to man-in-the-middle attacks:</p>
          <ul className="list-disc pl-5">
            <li>Use a VPN (e.g., NordVPN, ProtonVPN) to encrypt your traffic.</li>
            <li>Turn off sharing settings (e.g., file sharing, AirDrop).</li>
            <li>Avoid accessing sensitive accounts (e.g., banking) on public networks.</li>
            <li>Disable auto-connect to Wi-Fi networks.</li>
          </ul>
          <p className="mt-2">
            <strong>Alternative:</strong> Use mobile data for sensitive tasks if possible.
          </p>
        </>
      ),
    },
    {
      title: "Browser & Device Security",
      Component: () => (
        <>
          <p>Keep your devices and browsers secure:</p>
          <ul className="list-disc pl-5">
            <li>Enable automatic updates for your OS and browser.</li>
            <li>Use reputable antivirus software (e.g., Bitdefender, Malwarebytes).</li>
            <li>Configure browsers to block pop-ups and trackers (e.g., enable Do Not Track).</li>
            <li>Use a firewall to monitor incoming/outgoing traffic.</li>
          </ul>
          <p className="mt-2">
            <strong>Tip:</strong> Regularly check for firmware updates on your router.
          </p>
        </>
      ),
    },
  ],
  "Incident Reporting & Response": [
    {
      title: "Report to National CERTs",
      Component: () => (
        <>
          <p>Report cyber incidents to your local CERT:</p>
          <ul className="list-disc pl-5">
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
              (US-based users)
            </li>
          </ul>
          <p className="mt-2">
            <strong>Emergency Email:</strong>{" "}
            <a
              href="mailto:cyber999@cybersecurity.gov.my"
              className="text-indigo-500 hover:underline"
            >
              cyber999@cybersecurity.gov.my
            </a>{" "}
            (Malaysia, 24/7 as of May 19, 2025, 06:59 PM +08).
          </p>
        </>
      ),
    },
    {
      title: "How to File a Report",
      Component: () => (
        <>
          <p>Follow these steps to report a cyber incident:</p>
          <ol className="list-decimal pl-5">
            <li>Gather evidence (e.g., screenshots, email headers, URLs).</li>
            <li>Visit your national CERT website (see above).</li>
            <li>Fill out the incident report form with detailed information.</li>
            <li>Submit evidence and keep a record of your submission.</li>
            <li>Follow up with the CERT for updates on your case.</li>
          </ol>
          <p className="mt-2">
            <strong>Note:</strong> Act quickly to minimize damage.
          </p>
        </>
      ),
    },
  ],
  "News & Alerts": [
    {
      title: "Real-Time Threat Alerts",
      Component: () => (
        <>
          <p>Recent Threats (as of May 19, 2025):</p>
          <ul className="list-disc pl-5">
            <li>Phishing campaign targeting banking users via SMS (reported May 18, 2025).</li>
            <li>Zero-day exploit in Chromium browsers—update to version 124.0.6367.91.</li>
          </ul>
          <p className="mt-2">
            <a
              href="https://www.ncsc.gov.uk/section/information-for/individuals-families"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              Check NCSC for Latest Alerts »
            </a>
          </p>
        </>
      ),
    },
    {
      title: "Advisories & Warnings",
      Component: () => (
        <>
          <p>Trending Scams:</p>
          <ul className="list-disc pl-5">
            <li>Fake delivery notifications claiming missed packages.</li>
            <li>Bogus tech support calls pretending to be from Microsoft.</li>
          </ul>
          <p className="mt-2">
            <strong>Action:</strong> Report suspicious activity to your local CERT immediately.
          </p>
        </>
      ),
    },
  ],
  "Interactive Tools & Downloads": [
    {
      title: "Safe-Browsing Checklist (PDF)",
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
      title: "URL Hover Preview Tip",
      Component: () => (
        <>
          <p>Hover over links to preview their destination before clicking:</p>
          <p className="mt-1">
            Example: <a href="https://example.com" className="text-indigo-500 hover:underline">
              Hover over me
            </a>
          </p>
          <p className="mt-2">
            <strong>Tip:</strong> Use browser extensions like Linkclump to preview multiple links.
          </p>
        </>
      ),
    },
  ],
  "Frequently Asked Questions (FAQs)": [
    {
      title: "Common Questions",
      Component: () => (
        <>
          <p><strong>Q:</strong> Why was a site blocked by TrustLens?</p>
          <p><strong>A:</strong> It may be flagged as malicious. Contact support to appeal or verify.</p>
          <p className="mt-2"><strong>Q:</strong> How do I enable notifications for alerts?</p>
          <p><strong>A:</strong> Go to Settings Notifications and toggle them on.</p>
        </>
      ),
    },
    {
      title: "Troubleshooting",
      Component: () => (
        <>
          <p><strong>Issue:</strong> False positives (legitimate site blocked)</p>
          <ul className="list-disc pl-5">
            <li>Clear your browser cache and cookies.</li>
            <li>Submit a false positive report via the Support page.</li>
            <li>Check for browser extensions interfering with TrustLens.</li>
          </ul>
        </>
      ),
    },
  ],
  "Glossary & Cheat Sheet": [
    {
      title: "Common Acronyms & Terms",
      Component: () => (
        <dl className="pl-5 space-y-2">
          <div>
            <dt className="font-semibold">MFA</dt>
            <dd>Multi-Factor Authentication—adds extra verification steps (e.g., SMS code).</dd>
          </div>
          <div>
            <dt className="font-semibold">DNSSEC</dt>
            <dd>Domain Name System Security Extensions—prevents DNS spoofing.</dd>
          </div>
          <div>
            <dt className="font-semibold">SPF / DKIM / DMARC</dt>
            <dd>Email authentication protocols to prevent spoofing and phishing.</dd>
          </div>
          <div>
            <dt className="font-semibold">MITM</dt>
            <dd>Man-in-the-Middle attack—intercepts communication between two parties.</dd>
          </div>
          <div>
            <dt className="font-semibold">Zero-Day</dt>
            <dd>A vulnerability exploited before a patch is available.</dd>
          </div>
        </dl>
      ),
    },
  ],
};