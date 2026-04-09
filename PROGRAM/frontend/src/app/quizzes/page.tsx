"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { useToast } from "@/store/toastStore";
import { quizzesApi } from "@/lib/api/quizzes.api";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number; // in minutes
}

export default function QuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      // Mock quiz data - replace with actual API call
      const mockQuiz: Quiz = {
        id: "1",
        title: "JavaScript Fundamentals Quiz",
        description: "Test your knowledge of JavaScript basics",
        timeLimit: 10,
        questions: [
          {
            id: "1",
            question: "What is the correct way to declare a variable in JavaScript?",
            options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
            correctAnswer: 0,
          },
          {
            id: "2",
            question: "Which of the following is NOT a JavaScript data type?",
            options: ["string", "boolean", "integer", "undefined"],
            correctAnswer: 2,
          },
          {
            id: "3",
            question: "What does '===' operator do in JavaScript?",
            options: ["Assignment", "Comparison with type coercion", "Strict equality comparison", "Logical AND"],
            correctAnswer: 2,
          },
        ],
      };

      setQuiz(mockQuiz);

      // Start quiz attempt
      const attempt = await quizzesApi.startAttempt(mockQuiz.id);
      setAttemptId(attempt.id);

      setTimeLeft(mockQuiz.timeLimit ? mockQuiz.timeLimit * 60 : null);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load quiz");
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    try {
      let correctAnswers = 0;
      quiz.questions.forEach((question) => {
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
      setScore(finalScore);
      setSubmitted(true);

      // Mock API call to submit quiz
      if (attemptId) {
        await quizzesApi.submitAttempt(attemptId, {
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId: parseInt(questionId),
            answerId: answer,
          })),
        });
      }

      toast.success(`Quiz submitted! Score: ${finalScore}%`);
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <Card className="p-6">
          <div className="h-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </Card>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
          <div className="text-6xl mb-4">
            {score >= 80 ? "🎉" : score >= 60 ? "👍" : "💪"}
          </div>
          <p className="text-xl mb-2">Your Score: {score}%</p>
          <p className="text-zinc-500 mb-6">
            {score >= 80 ? "Excellent work!" : score >= 60 ? "Good job!" : "Keep practicing!"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/dashboard/student")}>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-zinc-500">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <Badge variant={timeLeft < 60 ? "destructive" : "secondary"}>
              Time: {formatTime(timeLeft)}
            </Badge>
          )}
          <Badge variant="outline">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mb-6">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

        <RadioGroup
          value={answers[question.id]?.toString() || ""}
          onValueChange={(value: string) => handleAnswerSelect(question.id, parseInt(value))}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="flex-1 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[question.id] === undefined}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6 flex flex-wrap gap-2">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestion(index)}
            className={`w-10 h-10 rounded-full border-2 transition-colors ${
              index === currentQuestion
                ? "border-orange-500 bg-orange-500 text-white"
                : answers[quiz.questions[index].id] !== undefined
                ? "border-green-500 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </main>
  );
}