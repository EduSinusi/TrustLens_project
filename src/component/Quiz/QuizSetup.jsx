import React, { useState } from "react";

// Temporary: Static demo questions by topic/level
const STATIC_QUESTIONS = {
  Phishing: {
    easy: [
      {
        question: "What is phishing?",
        choices: [
          "A type of firewall",
          "A fraudulent attempt to get sensitive info",
          "A secure password manager",
          "An encrypted network protocol",
        ],
        answer: 1,
      },
      {
        question: "Which is a sign of a phishing email?",
        choices: [
          "Unexpected attachment",
          "Correct company logo and grammar",
          "Sent from your boss’s email",
          "A reply to your message",
        ],
        answer: 0,
      },
    ],
    hard: [
      {
        question: "What’s the first thing to check in a suspicious email?",
        choices: [
          "Sender's address",
          "Subject line",
          "Recipient list",
          "File size of attachment",
        ],
        answer: 0,
      },
    ],
  },
  Passwords: {
    easy: [
      {
        question: "What is a strong password?",
        choices: [
          "Your birthdate",
          "123456",
          "A mix of letters, numbers, and symbols",
          "The word 'password'",
        ],
        answer: 2,
      },
    ],
    hard: [
      {
        question: "Which statement is TRUE about password managers?",
        choices: [
          "They’re unsafe and should not be used",
          "They help generate and store complex passwords securely",
          "They send your passwords to hackers",
          "They only work on mobile phones",
        ],
        answer: 1,
      },
    ],
  },
  "Social Engineering": {
    easy: [
      {
        question: "What is social engineering?",
        choices: [
          "Building social media profiles",
          "Manipulating people to give up confidential info",
          "Creating network diagrams",
          "Developing security software",
        ],
        answer: 1,
      },
    ],
    hard: [
      {
        question: "What is 'pretexting' in social engineering?",
        choices: [
          "Pretending to be someone else to get info",
          "Pre-testing security systems",
          "Using phishing emails",
          "Encrypting files before sending",
        ],
        answer: 0,
      },
    ],
  },
};

export default function QuizSetup({ level, topic, onBack }) {
  const questions = STATIC_QUESTIONS[topic][level] || [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showScore, setShowScore] = useState(false);

  const handleSelect = idx => {
    setAnswers(prev => [...prev, idx]);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setShowScore(true);
    }
  };

  const score =
    answers.reduce(
      (acc, ans, idx) => acc + (ans === questions[idx].answer ? 1 : 0),
      0
    ) || 0;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
      <div className="mb-4 flex justify-between items-center">
        <button onClick={onBack} className="text-sky-600 hover:underline text-sm">
          ← Back to setup
        </button>
        <span className="text-blue-500 text-sm">
          Topic: <span className="font-bold">{topic}</span> | Level:{" "}
          <span className="font-bold capitalize">{level}</span>
        </span>
      </div>

      {!showScore ? (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              Question {current + 1} of {questions.length}
            </h2>
            <p className="mt-2 text-lg text-blue-700">{questions[current].question}</p>
          </div>
          <div className="flex flex-col gap-3">
            {questions[current].choices.map((c, idx) => (
              <button
                key={idx}
                className="text-left px-5 py-2 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 transition text-base text-blue-800"
                onClick={() => handleSelect(idx)}
                disabled={answers.length > current}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold text-sky-700 mb-4">Quiz Complete!</h2>
          <p className="text-lg mb-2 text-blue-800">
            Your Score: <span className="font-semibold">{score} / {questions.length}</span>
          </p>
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
            onClick={onBack}
          >
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
