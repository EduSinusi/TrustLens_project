// BlockedUrlsTable.jsx
import React, { useState } from "react";

const BlockedUrlsTable = ({ blockedUrls }) => {
  const [isBlockedTableOpen, setIsBlockedTableOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Blocked URLs</h2>
        <button
          onClick={() => setIsBlockedTableOpen(!isBlockedTableOpen)}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center text-sm font-medium"
        >
          {isBlockedTableOpen ? "Hide Details" : "Show Details"}
        </button>
      </div>
      {isBlockedTableOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Blocked On</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              {blockedUrls.map((url, index) => (
                <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-3 px-4">{url.url}</td>
                  <td
                    className={`py-3 px-4 font-medium ${
                      url.status === "Safe"
                        ? "text-green-600"
                        : url.status === "Unsafe"
                        ? "text-red-600"
                        : url.status === "Potentially Unsafe"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {url.status}
                  </td>
                  <td className="py-3 px-4">{url.timestamp.toLocaleString()}</td>
                  <td className="py-3 px-4">{url.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlockedUrlsTable;