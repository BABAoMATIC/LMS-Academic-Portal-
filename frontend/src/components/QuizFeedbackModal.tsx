import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, Save } from 'lucide-react';

interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  marks_obtained: number;
  teacher_feedback?: string;
}

interface Question {
  id: number;
  question_text: string;
  type: string;
  marks: number;
}

interface QuizFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: number;
  studentId: number;
  studentName: string;
  quizTitle: string;
}

const QuizFeedbackModal: React.FC<QuizFeedbackModalProps> = ({
  isOpen,
  onClose,
  quizId,
  studentId,
  studentName,
  quizTitle
}) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudentResults();
    }
  }, [isOpen, quizId, studentId]);

  const fetchStudentResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/quiz/${quizId}/results/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnswers(data.attempt.answers || []);
        setQuestions(data.quiz.question_objects || []);
        
        // Initialize feedback state
        const feedbackState: Record<number, string> = {};
        data.attempt.answers.forEach((answer: Answer) => {
          if (answer.teacher_feedback) {
            feedbackState[answer.id] = answer.teacher_feedback;
          }
        });
        setFeedback(feedbackState);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to fetch student results');
      }
    } catch (error) {
      console.error('Error fetching student results:', error);
      setError('Failed to fetch student results');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (answerId: number, feedbackText: string) => {
    setFeedback(prev => ({
      ...prev,
      [answerId]: feedbackText
    }));
  };

  const handleSaveFeedback = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const feedbackData = Object.entries(feedback)
        .filter(([_, text]) => text.trim())
        .map(([answerId, text]) => ({
          answer_id: parseInt(answerId),
          feedback: text.trim()
        }));

      if (feedbackData.length === 0) {
        alert('Please provide at least one feedback comment');
        return;
      }

      const response = await fetch(`/api/quiz/${quizId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: feedbackData }),
      });

      if (response.ok) {
        console.log('✅ Feedback saved successfully');
        alert('Feedback saved successfully!');
        onClose();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save feedback');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      setError('Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  const getQuestionById = (questionId: number) => {
    return questions.find(q => q.id === questionId);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <div className="modal-title">
            <h2>Provide Quiz Feedback</h2>
            <p className="text-gray-600">
              {quizTitle} - {studentName}
            </p>
          </div>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading student results...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="error-icon">⚠️</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchStudentResults}
                className="action-button mt-4"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="feedback-container">
              <div className="feedback-instructions">
                <p className="text-sm text-gray-600 mb-4">
                  Provide feedback for incorrect answers to help the student learn and improve.
                </p>
              </div>

              <div className="answers-list">
                {answers.map((answer) => {
                  const question = getQuestionById(answer.question_id);
                  if (!question) return null;

                  return (
                    <div key={answer.id} className="answer-item">
                      <div className="answer-header">
                        <div className="answer-question">
                          <h4 className="font-medium">{question.question_text}</h4>
                          <div className="answer-meta">
                            <span className="text-sm text-gray-500">
                              {question.marks} mark{question.marks !== 1 ? 's' : ''}
                            </span>
                            <span className={`answer-status ${answer.is_correct ? 'correct' : 'incorrect'}`}>
                              {answer.is_correct ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Correct
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Incorrect
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="answer-marks">
                          {answer.marks_obtained}/{question.marks}
                        </div>
                      </div>

                      <div className="answer-content">
                        <div className="student-answer">
                          <label className="text-sm font-medium text-gray-700">
                            Student's Answer:
                          </label>
                          <p className="answer-text">{answer.answer_text || 'No answer provided'}</p>
                        </div>

                        {!answer.is_correct && (
                          <div className="feedback-section">
                            <label className="text-sm font-medium text-gray-700">
                              <MessageSquare className="w-4 h-4 mr-1 inline" />
                              Your Feedback:
                            </label>
                            <textarea
                              value={feedback[answer.id] || ''}
                              onChange={(e) => handleFeedbackChange(answer.id, e.target.value)}
                              placeholder="Provide constructive feedback to help the student understand the correct answer..."
                              className="feedback-textarea"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="action-button secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveFeedback}
            className="action-button primary"
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizFeedbackModal;
