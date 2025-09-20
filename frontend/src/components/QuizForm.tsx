import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Clock, BookOpen } from 'lucide-react';
import apiService from '../services/api';
import notificationService from '../services/notificationService';

interface Question {
  id?: number;
  question_text: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correct_answer: string;
  marks: number;
}

interface QuizFormProps {
  quiz?: {
    id: number;
    title: string;
    description: string;
    duration: number;
    deadline: string;
    module_name: string;
    questions?: Question[];
  };
  onClose: () => void;
  onSuccess: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    description: quiz?.description || '',
    duration: quiz?.duration || 30,
    deadline: quiz?.deadline ? quiz.deadline.split('T')[0] : '',
    module_name: quiz?.module_name || '',
  });
  const [questions, setQuestions] = useState<Question[]>(
    quiz?.questions || [
      {
        question_text: '',
        type: 'multiple_choice' as const,
        options: ['', '', '', ''],
        correct_answer: '',
        marks: 1
      }
    ]
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = ['', '', '', ''];
    }
    newQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(newQuestions);
  };

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    if (!formData.module_name.trim()) {
      newErrors.module_name = 'Module name is required';
    }

    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }

    // Validate questions
    questions.forEach((question, index) => {
      if (!question.question_text.trim()) {
        newErrors[`question_${index}`] = 'Question text is required';
      }

      if (question.type === 'multiple_choice') {
        const hasOptions = question.options?.some(option => option.trim());
        if (!hasOptions) {
          newErrors[`question_${index}_options`] = 'At least one option is required';
        }
      }

      if (!question.correct_answer.trim()) {
        newErrors[`question_${index}_answer`] = 'Correct answer is required';
      }

      if (question.marks < 1) {
        newErrors[`question_${index}_marks`] = 'Marks must be at least 1';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        questions: questions.map(q => ({
          ...q,
          options: q.type === 'multiple_choice' ? q.options : undefined
        }))
      };

      if (quiz) {
        // Update existing quiz
        await apiService.put(`/quizzes/${quiz.id}`, submitData);
      } else {
        // Create new quiz
        await apiService.post('/quizzes', submitData);
      }

      // Emit real-time notification
      if (notificationService.isSocketConnected()) {
        notificationService.emit('quiz_created', {
          title: formData.title,
          deadline: formData.deadline,
          module_name: formData.module_name,
          question_count: questions.length,
          message: `New quiz "${formData.title}" has been created`
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving quiz:', error);
      setErrors({ submit: 'Failed to save quiz. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter quiz title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Module Name */}
              <div>
                <label htmlFor="module_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Module Name *
                </label>
                <input
                  type="text"
                  id="module_name"
                  name="module_name"
                  value={formData.module_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.module_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter module name"
                />
                {errors.module_name && <p className="mt-1 text-sm text-red-600">{errors.module_name}</p>}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.deadline ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter quiz description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Question {index + 1}</h4>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text *
                        </label>
                        <textarea
                          value={question.question_text}
                          onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                          rows={2}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`question_${index}`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your question"
                        />
                        {errors[`question_${index}`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`question_${index}`]}</p>
                        )}
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Type *
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                      </div>

                      {/* Options for Multiple Choice */}
                      {question.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options *
                          </label>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <input
                                key={optionIndex}
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  errors[`question_${index}_options`] ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            ))}
                          </div>
                          {errors[`question_${index}_options`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_options`]}</p>
                          )}
                        </div>
                      )}

                      {/* Correct Answer */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </label>
                        {question.type === 'multiple_choice' ? (
                          <select
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`question_${index}_answer`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select correct answer</option>
                            {question.options?.map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option || `Option ${optionIndex + 1}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`question_${index}_answer`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter correct answer"
                          />
                        )}
                        {errors[`question_${index}_answer`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_answer`]}</p>
                        )}
                      </div>

                      {/* Marks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Marks *
                        </label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value) || 1)}
                          min="1"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`question_${index}_marks`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`question_${index}_marks`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_marks`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{quiz ? 'Update Quiz' : 'Create Quiz'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
