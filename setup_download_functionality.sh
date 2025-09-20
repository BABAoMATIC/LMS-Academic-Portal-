#!/bin/bash

echo "📥 Setting up Download Functionality"
echo "===================================="

# Navigate to backend directory
cd backend

echo "📊 Updating database schema for download tracking..."
python update_download_tracking_schema.py

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
else
    echo "❌ Database schema update failed!"
    exit 1
fi

echo ""
echo "🧪 Running download functionality tests..."
python test_download_functionality.py

if [ $? -eq 0 ]; then
    echo "✅ Download functionality tests passed!"
else
    echo "❌ Download functionality tests failed!"
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
echo "3. Test the download functionality:"
echo "   - Login as a student"
echo "   - Navigate to assignments"
echo "   - Click 'Download' button on assignments with files"
echo "   - Test submission downloads"
echo "   - Check download count updates"
echo ""
echo "✨ Features implemented:"
echo "   ✅ Download buttons for assignments and submissions"
echo "   ✅ Dynamic link generation based on user access"
echo "   ✅ Download count tracking for auditing"
echo "   ✅ Authorization and security controls"
echo "   ✅ File serving with proper headers"
echo "   ✅ Frontend download handling with blob creation"
echo "   ✅ Error handling and user feedback"
echo "   ✅ Download analytics and statistics"
echo "   ✅ Audit trail for file access"
echo ""
echo "🔧 Technical Details:"
echo "   • Backend routes: /api/assignments/{id}/download and /api/submissions/{id}/download"
echo "   • Database fields: download_count in assignments and submissions tables"
echo "   • Frontend components: Download buttons and SubmissionDownloadButton"
echo "   • Security: JWT authentication and role-based authorization"
echo "   • Tracking: Download count increments and activity logging"
echo ""
echo "🎯 User Experience:"
echo "   • Click 'Download' button → File downloads directly"
echo "   • Original filename preserved"
echo "   • Download count tracked for analytics"
echo "   • Error messages for failed downloads"
echo "   • Authorization prevents unauthorized access"
