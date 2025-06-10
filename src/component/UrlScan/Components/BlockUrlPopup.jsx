import React from "react";
import PropTypes from "prop-types";

const BlockUrlPopup = ({
  isOpen,
  onClose,
  onBlock,
  url,
  isBlocking,
  maliciousEngineCount = 0,
}) => {
  if (!isOpen) return null;

  const handleBlockClick = (e) => {
    e.stopPropagation();
    console.log("Block button clicked");
    onBlock();
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    console.log("Cancel button clicked");
    onClose();
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    console.log("Overlay clicked, closing popup");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-20 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Block Unsafe URL?
        </h2>
        <p className="text-gray-700 mb-4">
          The URL <span className="font-semibold">{url}</span> has been detected
          as unsafe. Would you like to block it?
        </p>
        {maliciousEngineCount > 0 && maliciousEngineCount < 5 && (
          <p className="text-yellow-600 text-sm mb-4">
            Disclaimer: Only {maliciousEngineCount} security engine
            {maliciousEngineCount > 1 ? "s" : ""} deemed this URL as unsafe. You
            may optionally continue browsing with precaution.
          </p>
        )}
        {isBlocking && (
          <p className="text-blue-600 mb-4 flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Please wait...
          </p>
        )}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBlocking}
          >
            Cancel
          </button>
          <button
            onClick={handleBlockClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isBlocking}
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
};

BlockUrlPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBlock: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  isBlocking: PropTypes.bool.isRequired,
  maliciousEngineCount: PropTypes.number, // Number of engines flagging as unsafe
};

export default BlockUrlPopup;
