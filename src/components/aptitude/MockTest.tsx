import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

interface MockTestProps {
  testId: number;
  title: string;
  questions: Question[];
}

const MockTest: React.FC<MockTestProps> = ({ testId, title, questions }) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 300) {
          setWarningMessage('Warning: 5 minutes remaining!');
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        } else if (prevTime === 120) {
          setWarningMessage('Warning: 2 minutes remaining!');
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        } else if (prevTime === 30) {
          setWarningMessage('Final Warning: 30 seconds remaining!');
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }

        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    return (correctCount / questions.length) * 100;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
  };

  if (!currentUser) {
    return (
      <div className="text-center p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600">
          Please login to access mock tests
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Warning Alert */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg z-50 animate-bounce text-sm sm:text-base">
          {warningMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        {!isSubmitted && (
          <div
            className={`mt-4 sm:mt-0 text-sm sm:text-lg font-medium px-4 py-2 rounded-md ${
              timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}
          >
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {!isSubmitted ? (
        <div className="space-y-6 sm:space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {question.category} - Question {question.id}
              </h3>
              <p className="mb-4 text-sm sm:text-base">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleAnswerSelect(question.id, option)}
                      className="form-radio text-blue-600"
                    />
                    <span className="text-sm sm:text-base">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Submit Test
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Test Results</h2>
          <p className="text-lg sm:text-xl mb-6">
            Your Score: {score.toFixed(2)}%
          </p>

          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border-b pb-4">
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  Question {question.id}
                </h3>
                <p className="mb-2 text-sm sm:text-base">{question.question}</p>
                <p
                  className={`mb-2 text-sm sm:text-base ${
                    answers[question.id] === question.correctAnswer
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  Your Answer: {answers[question.id] || 'Not answered'}
                </p>
                {answers[question.id] !== question.correctAnswer && (
                  <p className="text-green-600 text-sm sm:text-base">
                    Correct Answer: {question.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTest;
