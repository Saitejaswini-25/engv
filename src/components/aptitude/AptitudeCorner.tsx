import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MockTest from './MockTest';

// Mock Test 1 Data
const mockTest1 = {
  id: 1,
  title: "Aptitude",
  questions: [
    {
      id: 1,
      category: "Logical Reasoning",
      question: "8,11,21,15,18,21,22,_ _",
      options: ["25,18", "25,21", "24,21", "22,26"],
      correctAnswer: "25,21"
    },
    {
      id: 2,
      category: "Logical Reasoning",
      question: "Pointing to Varman, Madhav said, \"I am the only son of one of the sons of his father.\" How is Varman related to Madhav?",
      options: ["Father", "Uncle", "Brother", "Grandfather"],
      correctAnswer: "Father"
    },
    {
      id: 3,
      category: "Microsoft Office",
      question: "Mini Translator in MS Word — what is true?",
      options: [
        "Both statements are correct",
        "Both statements are incorrect",
        "Only statement 2 is correct",
        "Only statement 1 is correct"
      ],
      correctAnswer: "Both statements are correct"
    },
    // Add more questions from Mock Test 1...
  ]
};

// Mock Test 2 Data
const mockTest2 = {
  id: 2,
  title: "Quant",
  questions: [
    {
      id: 1,
      category: "Averages",
      question: "Avg. of 5 consecutive numbers is 18. Largest?",
      options: ["18", "20", "22", "24"],
      correctAnswer: "20"
    },
    {
      id: 2,
      category: "Averages",
      question: "Avg. of 13 consecutive natural numbers, 7th is 22. X=?",
      options: ["20", "22", "24", "26"],
      correctAnswer: "22"
    },
    // Add more questions from Mock Test 2...
  ]
};

const AptitudeCorner: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Please login to access the Aptitude Corner</h2>
      </div>
    );
  }

  if (selectedTest) {
    const test = selectedTest === 1 ? mockTest1 : mockTest2;
    return (
      <div>
        <button
          onClick={() => setSelectedTest(null)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          ← Back to Tests
        </button>
        <MockTest
          testId={test.id}
          title={test.title}
          questions={test.questions}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Aptitude Corner</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{mockTest1.title}</h2>
          <p className="text-gray-600 mb-4">
            Test your skills in Aptitude, Technical, Reasoning, and Verbal abilities.
          </p>
          <button
            onClick={() => setSelectedTest(1)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Test
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{mockTest2.title}</h2>
          <p className="text-gray-600 mb-4">
            Challenge yourself with Quantitative, Logical, Coding, and Reasoning questions.
          </p>
          <button
            onClick={() => setSelectedTest(2)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default AptitudeCorner; 