#!/bin/bash

echo "🔍 Setting up Assignment Preview Functionality"
echo "=============================================="

# Navigate to backend directory
cd backend

echo "🧪 Running assignment preview tests..."
python test_assignment_preview.py

if [ $? -eq 0 ]; then
    echo "✅ Assignment preview tests passed!"
else
    echo "❌ Assignment preview tests failed!"
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
echo "3. Test the preview functionality:"
echo "   - Login as a student"
echo "   - Navigate to assignments"
echo "   - Click 'Preview' button on assignments with files"
echo "   - Test different file types:"
echo "     • PDF files (opens in iframe)"
echo "     • Image files (displays with responsive sizing)"
echo "     • Video files (plays with controls)"
echo "     • Text files (shows content with formatting)"
echo "     • Word documents (shows as text)"
echo "   - Test download functionality within the modal"
echo ""
echo "✨ Features implemented:"
echo "   ✅ File type detection and appropriate viewers"
echo "   ✅ PDF preview with iframe embedding"
echo "   ✅ Image preview with responsive display"
echo "   ✅ Video preview with HTML5 controls"
echo "   ✅ Text file preview with proper formatting"
echo "   ✅ Download functionality within preview modal"
echo "   ✅ Error handling for unsupported file types"
echo "   ✅ Loading states and user feedback"
echo "   ✅ Responsive modal design"
echo "   ✅ Security: Authentication required for file access"
echo "   ✅ Access control: Students can view all, teachers only their own"
echo ""
echo "🔧 Technical Details:"
echo "   • Backend routes: /api/assignments/{id}/preview and /download"
echo "   • Frontend component: AssignmentPreviewModal"
echo "   • File type detection: Based on extension and MIME type"
echo "   • Content-Type headers: Properly set for each file type"
echo "   • Security: JWT authentication and role-based access"
echo ""
echo "🎯 User Experience:"
echo "   • Click 'Preview' button → Modal opens instantly"
echo "   • File loads with appropriate viewer"
echo "   • Download button available within modal"
echo "   • Close button or click outside to dismiss"
echo "   • Error messages for unsupported files"
echo "   • Loading indicators during file fetch"
