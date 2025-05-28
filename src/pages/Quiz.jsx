import React, { useState } from "react";
import QuizSetup from "../component/Quiz/QuizSetup";

const TOPICS = ["Phishing", "Passwords", "Social Engineering"];
const LEVELS = ["easy", "hard"];

export default function Quiz() {
  const [step, setStep] = useState("setup");
  const [level, setLevel] = useState("easy");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [quizParams, setQuizParams] = useState(null);

  const handleStart = () => {
    setQuizParams({ level, topic });
    setStep("quiz");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-sky-50">
      {step === "setup" && (
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-4">TrustLens Cybersecurity Quiz</h1>
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-lg">Select Level:</label>
            <div className="flex gap-4">
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  className={`px-4 py-2 rounded-lg font-medium border-2 transition ${
                    level === lvl
                      ? "bg-sky-500 text-white border-blue-600"
                      : "bg-gray-100 text-blue-700 border-blue-200"
                  }`}
                  onClick={() => setLevel(lvl)}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-lg">Select Topic:</label>
            <select
              className="px-4 py-2 rounded-lg border border-blue-200 bg-sky-50"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            >
              {TOPICS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl shadow hover:bg-blue-700 transition"
            onClick={handleStart}
          >
            Start Quiz
          </button>
        </div>
      )}

      {step === "quiz" && quizParams && (
        <QuizSetup
          level={quizParams.level}
          topic={quizParams.topic}
          onBack={() => setStep("setup")}
        />
      )}
    </div>
  );
}
