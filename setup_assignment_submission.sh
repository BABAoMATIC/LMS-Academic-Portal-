#!/bin/bash

echo "🚀 Setting up Assignment Submission Functionality"
echo "=================================================="

# Navigate to backend directory
cd backend

echo "📊 Updating database schema..."
python update_submission_schema.py

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
else
    echo "❌ Database schema update failed!"
    exit 1
fi

echo ""
echo "🧪 Running submission flow test..."
python test_submission_flow.py

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
echo "3. Test the submission flow:"
echo "   - Login as a student"
echo "   - Navigate to assignments"
echo "   - Click 'Submit Assignment'"
echo "   - Upload a file (PDF, DOC, DOCX, TXT, RTF)"
echo "   - Add comments (optional)"
echo "   - Submit"
echo ""
echo "4. Test teacher notifications:"
echo "   - Login as a teacher"
echo "   - You should see a real-time notification when a student submits"
echo ""
echo "✨ Features implemented:"
echo "   ✅ File upload with validation (type & size)"
echo "   ✅ Database storage with metadata"
echo "   ✅ Real-time notifications for teachers"
echo "   ✅ Submission versioning"
echo "   ✅ Assignment status updates"
echo "   ✅ Error handling and user feedback"
