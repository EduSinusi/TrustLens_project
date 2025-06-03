import React, { useState } from "react";
import QuizSetup from "../component/Quiz/QuizSetup";
const TOPICS = ["Phishing", "Passwords", "Social Engineering"];

export default function Quiz() {
  const [step, setStep] = useState("setup");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [quizParams, setQuizParams] = useState(null);

  const handleStart = () => {
    setQuizParams({ topic });
    setStep("quiz");
  };

  return (
    <div className="min-h-full bg-sky-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {step === "setup" && (
        <>
          <h1 className="text-6xl font-extrabold text-center mb-10 bg-gray-700 text-transparent bg-clip-text">
            TrustLens Cybersecurity Quiz
          </h1>
          <div className="w-full max-w-[800px] mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-blue-200 transform transition-all hover:shadow-blue-300">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Instructions
              </h3>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Select a topic to start the quiz.</li>
                <li>Each question may include an image for reference.</li>
                <li>Choose the correct answer from the options provided.</li>
                <li>Click "Start Quiz" to begin and enjoy learning!</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Select Topic
                </label>
                <select
                  id="topic"
                  name="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t} className="bg-white">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold text-lg shadow-md hover:from-blue-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-102"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </>
      )}

      {step === "quiz" && quizParams && (
        <QuizSetup topic={quizParams.topic} onBack={() => setStep("setup")} />
      )}
    </div>
  );
}