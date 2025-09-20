import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Send, Clock, User, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface QuizAttempt {
  id: number;
  student_name: string;
  quiz_title: string;
  score: number;
  percentage: number;
  status: 'pass' | 'fail';
  completed_at: string;
}

interface QuizAnswer {
  question_id: number;
  question_text: string;
  type: string;
  options: string[];
  correct_answer: string;
  marks: number;
  student_answer: string;
  is_correct: boolean;
  marks_obtained: number;
  teacher_feedback?: string;
}

interface QuizReviewData {
  attempt: QuizAttempt;
  answers: QuizAnswer[];
}

const TeacherQuizReview: React.FC<{ quizId: number; attemptId: number }> = ({ quizId, attemptId }) => {
  const [reviewData, setReviewData] = useState<QuizReviewData | null>(null);
  const [feedback, setFeedback] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizAttemptDetails();
  }, [quizId, attemptId]);

  const fetchQuizAttemptDetails = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts/${attemptId}`);
      const data = await response.json();
      
      if (data.attempt && data.answers) {
        setReviewData(data);
        
        // Initialize feedback state with existing feedback
        const existingFeedback: { [key: number]: string } = {};
        data.answers.forEach((answer: QuizAnswer) => {
          if (answer.teacher_feedback) {
            existingFeedback[answer.question_id] = answer.teacher_feedback;
          }
        });
        setFeedback(existingFeedback);
      } else {
        setError('Quiz attempt not found');
      }
    } catch (error) {
      console.error('Error fetching quiz attempt details:', error);
      setError('Failed to load quiz attempt details');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (questionId: number, feedbackText: string) => {
    setFeedback(prev => ({
      ...prev,
      [questionId]: feedbackText
    }));
  };

  const submitFeedback = async (questionId: number) => {
    if (!feedback[questionId]?.trim()) {
      alert('Please enter feedback before submitting');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts/${attemptId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: user?.id,
          question_id: questionId,
          feedback: feedback[questionId]
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Feedback submitted for question ${questionId}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <Award className="w-4 h-4" />;
      case 'true_false':
        return <CheckCircle className="w-4 h-4" />;
      case 'short_answer':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h3>
        <p className="text-gray-600">Unable to load quiz attempt details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Quiz Attempt Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2" />
              Quiz Review: {reviewData.attempt.quiz_title}
            </h1>
            <p className="text-gray-600 mt-1">Student: {reviewData.attempt.student_name}</p>
          </div>
          <div className="text-right">
            <div className={`px-4 py-2 rounded-full text-sm font-medium mb-2 ${
              reviewData.attempt.status === 'pass' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {reviewData.attempt.status.toUpperCase()}
            </div>
            <p className="text-sm text-gray-500">
              Completed: {formatDate(reviewData.attempt.completed_at)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{reviewData.attempt.score}</div>
            <div className="text-sm text-blue-600">Score</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{reviewData.attempt.percentage.toFixed(1)}%</div>
            <div className="text-sm text-green-600">Percentage</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{reviewData.answers.length}</div>
            <div className="text-sm text-purple-600">Total Questions</div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-6">
        {reviewData.answers.map((answer, index) => (
          <div key={answer.question_id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getQuestionTypeIcon(answer.type)}
                <span className="ml-2 text-sm font-medium text-gray-600 capitalize">
                  {answer.type.replace('_', ' ')}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {answer.marks} marks
                </span>
              </div>
              <div className="flex items-center">
                {answer.is_correct ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="ml-2 text-sm text-gray-600">
                  {answer.marks_obtained}/{answer.marks} marks
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Question {index + 1}: {answer.question_text}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Student's Answer:</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{answer.student_answer || 'No answer provided'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Correct Answer:</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-gray-900">{answer.correct_answer}</p>
                </div>
              </div>
            </div>

            {/* Options for multiple choice questions */}
            {answer.type === 'multiple_choice' && answer.options.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Available Options:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {answer.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-2 rounded-lg text-sm ${
                        option === answer.correct_answer
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : option === answer.student_answer
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {option}
                      {option === answer.correct_answer && ' ✓'}
                      {option === answer.student_answer && option !== answer.correct_answer && ' ✗'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Feedback Section */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Teacher Feedback
              </h4>
              
              <div className="space-y-3">
                <textarea
                  value={feedback[answer.question_id] || ''}
                  onChange={(e) => handleFeedbackChange(answer.question_id, e.target.value)}
                  placeholder="Provide feedback for this answer..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {answer.is_correct 
                      ? 'Student answered correctly. You can still provide additional feedback or encouragement.'
                      : 'Student answered incorrectly. Please provide helpful feedback to guide their learning.'
                    }
                  </p>
                  
                  <button
                    onClick={() => submitFeedback(answer.question_id)}
                    disabled={isSubmitting || !feedback[answer.question_id]?.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Performance Overview</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Total Questions: {reviewData.answers.length}</li>
              <li>• Correct Answers: {reviewData.answers.filter(a => a.is_correct).length}</li>
              <li>• Incorrect Answers: {reviewData.answers.filter(a => !a.is_correct).length}</li>
              <li>• Accuracy Rate: {((reviewData.answers.filter(a => a.is_correct).length / reviewData.answers.length) * 100).toFixed(1)}%</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Feedback Status</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Questions with Feedback: {Object.keys(feedback).filter(key => feedback[parseInt(key)]?.trim()).length}</li>
              <li>• Questions Pending Feedback: {reviewData.answers.length - Object.keys(feedback).filter(key => feedback[parseInt(key)]?.trim()).length}</li>
              <li>• Focus Areas: {reviewData.answers.filter(a => !a.is_correct).length} incorrect answers need attention</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherQuizReview;
