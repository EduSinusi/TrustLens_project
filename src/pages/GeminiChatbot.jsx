import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Lottie from "lottie-react";
import animationLandingPage from "../../src/assets/Animation - chatbot (2).json";

export default function GeminiChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputPlaceholder, setInputPlaceholder] = useState(
    "Type your question and press Enter…"
  );
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, error]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // Restore placeholder if input is empty
  useEffect(() => {
    if (!input) setInputPlaceholder("Type your question and press Enter…");
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim()) {
      setError("Please enter a message.");
      return;
    }

    setInput(""); // Clear input IMMEDIATELY on send
    setInputPlaceholder(""); // Clear placeholder IMMEDIATELY on send

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:7000/api/chat",
        {
          prompt: input,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        }
      );

      const reply = res.data.response;
      const aiMsg = { role: "ai", text: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Network error. Please ensure the server is running at http://localhost:7000.";
      setError(`⚠️ ${errorMsg}`);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `⚠️ Error: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-sky-100 flex items-center justify-center p-8 font-poppins">
      <div className="w-[1300px] h-[630px] bg-white backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col px-0 pt-2 pb-4 border-teal-200/30">
        <Lottie
          animationData={animationLandingPage}
          loop={true}
          playbackRate={0.5}
          style={{ width: 55, height: 55, position: "absolute", top: 14, right: 805 }}
        />
        <h1 className="text-3xl font-bold text-center mb-1 mt-3 bg-sky-700 text-transparent bg-clip-text">
          TrustLens AI Chatbot
        </h1>
        <p className="text-gray-700 mb-1 text-center text-lg leading-relaxed opacity-90">
          Ask me anything about cybersecurity for instant, helpful advice!
        </p>
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 max-h-[55vh] my-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } items-end w-full`}
            >
              {msg.role === "ai" && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-9 h-9 rounded-full bg-sky-300 flex items-center justify-center text-white font-bold shadow">
                    <span role="img" aria-label="AI">
                      🤖
                    </span>
                  </div>
                </div>
              )}
              <div
                className={`px-3.5 pt-2 text-[18px] rounded-2xl shadow-lg max-w-[75%] break-words ${
                  msg.role === "user"
                    ? "pb-2 bg-gradient-to-br from-teal-400 to-teal-600 text-white"
                    : "pb-1 bg-gradient-to-r from-sky-200 to-sky-300 text-gray-700"
                }`}
                style={{ animation: "fadeIn 0.3s" }}
              >
                {msg.role === "ai" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <table className="min-w-full border-collapse border border-slate-300 my-2 bg-white">
                          {props.children}
                        </table>
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border text-gray-800 border-slate-300 bg-slate-400 px-2 py-1 text-left font-bold">
                          {props.children}
                        </th>
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-slate-300 px-2 py-1">
                          {props.children}
                        </td>
                      ),
                      tr: ({ node, ...props }) => <tr>{props.children}</tr>,
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc pl-6" {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol className="list-decimal pl-6" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2" {...props} />
                      ),
                      code: ({ node, ...props }) => (
                        <code className="bg-gray-200 px-1 rounded" {...props} />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-line">{msg.text}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold shadow">
                    <span role="img" aria-label="You">
                      🧑
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start text-lg text-teal-600 font-medium">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
          {error && (
            <p className="text-center text-red-500 text-base font-medium">
              {error}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Divider */}
        <div className="w-full bg-gradient-to-r from-transparent via-teal-200 to-transparent"></div>

        {/* Input area */}
        <div className="flex items-center gap-2 px-6 pb-0.5">
          <input
            type="text"
            className="flex-1 py-2 px-3 text-lg rounded-xl bg-white/80 border border-teal-300/60 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder-gray-500"
            placeholder={inputPlaceholder}
            value={input}
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            disabled={loading}
            autoFocus
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2.5 bg-teal-500 text-white text-xl font-semibold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </div>

        {/* Powered by Gemini CENTERED under input */}
        <div className="flex justify-center items-center mt-1">
          <span className="text-sm text-gray-600 font-medium italic mr-2">
            Powered by
          </span>
          <img
            src="/Google_Gemini_logo.png"
            alt="Gemini Logo"
            className="w-12 h-auto"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.07))" }}
          />
        </div>
      </div>
      {/* Fade in animation style */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
