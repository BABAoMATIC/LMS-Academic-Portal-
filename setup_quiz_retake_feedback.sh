#!/bin/bash

echo "🔄 Setting up Quiz Retake and Feedback Functionality"
echo "=================================================="

# Navigate to backend directory
cd backend

echo "📊 Updating database schema for quiz attempts and feedback..."
python update_quiz_attempt_schema.py

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
else
    echo "❌ Database schema update failed!"
    exit 1
fi

echo ""
echo "🧪 Running quiz retake and feedback tests..."
python test_quiz_retake_feedback.py

if [ $? -eq 0 ]; then
    echo "✅ Quiz retake and feedback tests passed!"
else
    echo "❌ Quiz retake and feedback tests failed!"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && python main.py"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Test the quiz retake functionality:"
echo "   - Login as a student"
echo "   - Navigate to quizzes"
echo "   - Take a quiz"
echo "   - Click 'Retake Quiz' button"
echo "   - Verify timer resets and answers are cleared"
echo "   - Submit the retake and check grading"
echo ""
echo "4. Test the professor feedback system:"
echo "   - Login as a teacher"
echo "   - View student quiz results"
echo "   - Provide feedback for incorrect answers"
echo "   - Verify feedback is immediately visible to student"
echo ""
echo "✨ Features implemented:"
echo "   ✅ Quiz retake functionality with timer reset"
echo "   ✅ Answer clearing from database on retake"
echo "   ✅ Real-time grading and updates"
echo "   ✅ Professor feedback system for incorrect answers"
echo "   ✅ Real-time feedback visibility to students"
echo "   ✅ Complete audit trail for attempts"
echo "   ✅ Authorization and security controls"
echo "   ✅ Error handling and validation"
echo "   ✅ Frontend integration with retake buttons"
echo "   ✅ Socket.io real-time updates"
echo ""
echo "🔧 Technical Details:"
echo "   • Backend routes: /api/quiz/{id}/retake, /api/quiz/{id}/feedback"
echo "   • Database tables: quiz_attempts, updated answers table"
echo "   • Frontend components: TakeQuiz, QuizFeedbackModal"
echo "   • Security: JWT authentication and role-based authorization"
echo "   • Real-time: Socket.io events for retakes and feedback"
echo ""
echo "🎯 User Experience:"
echo "   • Students: Click 'Retake Quiz' → Timer resets → Answer again → Get graded"
echo "   • Teachers: View results → Provide feedback → Students see immediately"
echo "   • Real-time updates and notifications"
echo "   • Complete audit trail of all attempts"
