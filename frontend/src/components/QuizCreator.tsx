import React, { useState } from 'react';
import { Plus, Calendar, Clock, HelpCircle, X, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  question_text: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correct_answer: string;
  marks: number;
}

interface QuizCreatorProps {
  onQuizCreated?: () => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ onQuizCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    duration: 60,
    total_marks: 100
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: 1
    }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: 1
    }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = ['', '', '', ''];
    }
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question_text.trim() && 
      q.correct_answer.trim() && 
      (q.type === 'short_answer' || (q.options && q.options.some(opt => opt.trim())))
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/quizzes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: user.id,
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          duration: formData.duration,
          total_marks: formData.total_marks,
          questions: validQuestions
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quiz created successfully:', result);
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          deadline: '',
          duration: 60,
          total_marks: 100
        });
        setQuestions([{
          question_text: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correct_answer: '',
          marks: 1
        }]);
        setIsOpen(false);
        
        if (onQuizCreated) {
          onQuizCreated();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Quiz
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Quiz</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter quiz description"
                />
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Questions</h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Question {qIndex + 1}</h5>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text *
                          </label>
                          <input
                            type="text"
                            required
                            value={question.question_text}
                            onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter question"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="short_answer">Short Answer</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Marks
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={question.marks}
                              onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {question.type === 'multiple_choice' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Options
                            </label>
                            <div className="space-y-2">
                              {question.options?.map((option, oIndex) => (
                                <input
                                  key={oIndex}
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder={`Option ${oIndex + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correct Answer *
                          </label>
                          <input
                            type="text"
                            required
                            value={question.correct_answer}
                            onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder={question.type === 'multiple_choice' ? 'Enter correct option' : 'Enter correct answer'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Quiz created and students notified!
          </div>
        </div>
      )}
    </>
  );
};

export default QuizCreator;
