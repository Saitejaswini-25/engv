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
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const { currentUser } = useAuth();

  // Timer effect
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        // Show warnings at specific time intervals
        if (prevTime === 300) { // 5 minutes
          setWarningMessage('Warning: 5 minutes remaining!');
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        } else if (prevTime === 120) { // 2 minutes
          setWarningMessage('Warning: 2 minutes remaining!');
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        } else if (prevTime === 30) { // 30 seconds
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
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach(question => {
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
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Please login to access mock tests</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Warning Alert */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {warningMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {!isSubmitted && (
          <div className={`text-xl font-semibold px-4 py-2 rounded-md ${
            timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100'
          }`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </div>
      
      {!isSubmitted ? (
        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                {question.category} - Question {question.id}
              </h3>
              <p className="mb-4">{question.question}</p>
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
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Test
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Test Results</h2>
          <p className="text-xl mb-6">Your Score: {score.toFixed(2)}%</p>
          
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border-b pb-4">
                <h3 className="font-semibold mb-2">Question {question.id}</h3>
                <p className="mb-2">{question.question}</p>
                <p className={`mb-2 ${
                  answers[question.id] === question.correctAnswer
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  Your Answer: {answers[question.id] || 'Not answered'}
                </p>
                {answers[question.id] !== question.correctAnswer && (
                  <p className="text-green-600">
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