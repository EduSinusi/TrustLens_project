// src/component/Quiz/QuizSetup.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function QuizSetup({ topic, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchQuestions = async () => {
      try {
        const quizDocRef = doc(db, "quizzes", topic);
        const docSnap = await getDoc(quizDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const rawArray = data["Easy"] || [];

          const fetchedQuestions = rawArray.map((q) => {
            const choices = Object.values(q.Choice || {});
            const figureUrl = q.Figure || "";

            return {
              question: q.Question,
              choices: choices,
              answer: choices.findIndex((c) => c === q.Answer),
              reference: q.Reference || "",
              figure: figureUrl,
            };
          });

          // Shuffle the questions using Fisher-Yates algorithm
          const shuffledQuestions = [...fetchedQuestions];
          for (let i = shuffledQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
          }

          setQuestions(shuffledQuestions);
        } else {
          setError(`No quiz data found for topic: ${topic}`);
        }
      } catch (firestoreError) {
        console.error("Error fetching questions:", firestoreError);
        setError("Failed to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, topic]);

  const handleSelect = (idx) => {
    if (answers.length > current) return;

    setAnswers([...answers, idx]);
    if (current + 1 === questions.length) {
      setShowScore(true);
    } else {
      setTimeout(() => setCurrent(current + 1), 200);
    }
  };

  const score = answers.reduce((sum, a, i) => {
    return sum + (a === questions[i].answer ? 1 : 0);
  }, 0);

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-blue-100 text-center">
        <p className="text-lg text-blue-700">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-blue-100 text-center">
        <p className="text-lg text-blue-700">Please sign in to access the quiz.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
        >
          Back to Setup
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-blue-100 text-center">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
        >
          Back to Setup
        </button>
      </div>
    );
  }

  return (
    <div className="w-[1100px] mx-auto bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
      <div className="mb-2 flex justify-between items-center">
        <button onClick={onBack} className="text-sky-600 hover:underline text-sm">
          ← Back to setup
        </button>
        <span className="text-blue-500 text-sm">
          Topic: <span className="font-bold">{topic}</span>
        </span>
      </div>

      {!showScore ? (
        <>
          {questions.length > 0 ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-blue-800">
                  Question {current + 1} of {questions.length}
                </h2>
                <p className="mt-2 text-lg text-blue-700">
                  {questions[current].question}
                </p>

                {questions[current].figure && (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm text-gray-600">Related Image:</p>
                    <img
                      src={questions[current].figure}
                      alt="Question figure"
                      className="max-w-[2000px] h-full rounded-lg border border-gray-300"
                      style={{ maxHeight: "" }}
                      onError={(e) => {
                        console.error(
                          "Failed to load image:",
                          questions[current].figure
                        );
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {questions[current].choices.map((choiceText, idx) => (
                  <button
                    key={idx}
                    className="text-left px-5 py-2 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 transition text-base text-blue-800"
                    onClick={() => handleSelect(idx)}
                    disabled={answers.length > current}
                  >
                    {choiceText}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-lg text-blue-700 text-center">
              No questions available for this topic.
            </p>
          )}
        </>
      ) : (
        <div className="text-center mt-4">
          {!showReview ? (
            <>
              <h2 className="text-2xl font-bold text-sky-700 mb-3">Quiz Complete!</h2>
              <p className="text-lg mb-4 text-blue-800">
                Your Score:{" "}
                <span className="font-semibold">
                  {score} / {questions.length}
                </span>
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowReview(true)}
                  className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-xl shadow hover:bg-teal-600 transition"
                >
                  Review Answers
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Try Another Quiz
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-sky-700 mb-6">Review Your Answers</h2>
              <div className="space-y-8">
                {questions.map((q, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-6">
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">
                      Question {idx + 1}: {q.question}
                    </h3>
                    {q.figure && (
                      <div className="mb-4 flex flex-col gap-2">
                        <p className="text-sm text-gray-600">Related Image:</p>
                        <img
                          src={q.figure}
                          alt={`Question ${idx + 1} figure`}
                          className="max-w-[800px] h-auto rounded-lg border border-gray-300 mx-auto"
                          onError={(e) => {
                            console.error("Failed to load image:", q.figure);
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <p className="text-base text-gray-700 mb-2">
                      Your Answer: <span className="font-medium">{q.choices[answers[idx]]}</span>
                      {answers[idx] === q.answer ? (
                        <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                      ) : (
                        <span className="ml-2 text-red-600 font-semibold">✗ Incorrect</span>
                      )}
                    </p>
                    {answers[idx] !== q.answer && (
                      <p className="text-base text-gray-700">
                        Correct Answer: <span className="font-medium text-green-600">{q.choices[q.answer]}</span>
                      </p>
                    )}
                    {q.reference && (
                      <p className="text-sm text-gray-600 mt-2">
                        Reference: <span className="italic">{q.reference}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-xl shadow hover:bg-gray-600 transition"
                >
                  Back to Score
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
                >
                  Try Another Quiz
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 