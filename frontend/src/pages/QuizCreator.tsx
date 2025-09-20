import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice';
  options: string[];
  correct_answer: number;
  marks: number;
  order: number;
}

interface Quiz {
  title: string;
  description: string;
  deadline: string;
  is_active: boolean;
  questions: Question[];
}

const QuizCreator: React.FC = () => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    description: '',
    deadline: '',
    is_active: true,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: 0,
    marks: 1,
    order: 0
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      setError('Access denied. Teachers only.');
    }
  }, [user]);

  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    if (currentQuestion.correct_answer >= currentQuestion.options.length) {
      setError('Correct answer must be a valid option index');
      return;
    }

    const newQuestion: Question = {
      ...currentQuestion,
      id: Date.now().toString(),
      order: quiz.questions.length
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question
    setCurrentQuestion({
      id: '',
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: 0,
      marks: 1,
      order: 0
    });

    setError(null);
  };

  const editQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setCurrentQuestion(quiz.questions[index]);
  };

  const updateQuestion = () => {
    if (editingQuestionIndex === null) return;

    if (!currentQuestion.question_text.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      setError('All options must be filled');
      return;
    }

    const updatedQuestions = [...quiz.questions];
    updatedQuestions[editingQuestionIndex] = {
      ...currentQuestion,
      order: editingQuestionIndex
    };

    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));

    setEditingQuestionIndex(null);
    setCurrentQuestion({
      id: '',
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: 0,
      marks: 1,
      order: 0
    });

    setError(null);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions.map((q, i) => ({ ...q, order: i }))
    }));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === quiz.questions.length - 1)
    ) {
      return;
    }

    const updatedQuestions = [...quiz.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index]
    ];

    // Update order
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });

    setQuiz(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleSubmit = async () => {
    if (!quiz.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (quiz.questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    if (!quiz.deadline) {
      setError('Deadline is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const quizData = {
        title: quiz.title,
        description: quiz.description,
        teacher_id: user!.id,
        deadline: quiz.deadline,
        is_active: quiz.is_active,
        questions: quiz.questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks
        }))
      };

      await apiService.createQuiz(quizData);
      
      setSuccess('Quiz created successfully!');
      setQuiz({
        title: '',
        description: '',
        deadline: '',
        is_active: true,
        questions: []
      });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create quiz');
      console.error('Error creating quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      setError('At least 2 options are required');
      return;
    }

    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correct_answer: prev.correct_answer >= index ? Math.max(0, prev.correct_answer - 1) : prev.correct_answer
    }));
  };

  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to teachers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
          <p className="text-gray-600 mt-2">Build a comprehensive quiz for your students</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quiz.description}
                    onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={quiz.deadline}
                    onChange={(e) => setQuiz(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={quiz.is_active}
                    onChange={(e) => setQuiz(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active Quiz
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading || quiz.questions.length === 0}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Quiz...' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </div>

          {/* Question Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Question Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion.question_text}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options *
                  </label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={currentQuestion.correct_answer === index}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, correct_answer: index }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        {currentQuestion.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addOption}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Option
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, marks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  {editingQuestionIndex !== null ? (
                    <>
                      <button
                        onClick={updateQuestion}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                      >
                        Update Question
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestionIndex(null);
                          setCurrentQuestion({
                            id: '',
                            question_text: '',
                            question_type: 'multiple_choice',
                            options: ['', '', '', ''],
                            correct_answer: 0,
                            marks: 1,
                            order: 0
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={addQuestion}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions List */}
            {quiz.questions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Questions ({quiz.questions.length})
                </h3>
                
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === quiz.questions.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => editQuestion(index)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteQuestion(index)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-900 mb-3">{question.question_text}</p>
                      
                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={question.correct_answer === optIndex}
                              disabled
                              className="h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <span className={`text-sm ${question.correct_answer === optIndex ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {option}
                              {question.correct_answer === optIndex && ' (Correct)'}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Marks: {question.marks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
