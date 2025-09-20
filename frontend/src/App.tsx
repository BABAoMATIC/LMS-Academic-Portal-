import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import './styles/clean-styles.css';
// import './styles/responsive-system.css';
// import './styles/responsive-layout.css';
// import './styles/responsive-navigation.css';
import { ToastProvider } from './components/Toast';

import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import BeautifulDashboard from './components/BeautifulDashboard';
import RealTimeNotificationPopup from './components/RealTimeNotificationPopup';



// Import i18n configuration
import './utils/i18n';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard';
import EnhancedTeacherDashboard from './pages/EnhancedTeacherDashboard';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import AssignmentSubmission from './pages/AssignmentSubmission';
import QuizTaking from './pages/QuizTaking';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizDetails from './components/QuizDetails';
import Submissions from './pages/Submissions';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Calendar from './pages/Calendar';
import AdminDashboard from './pages/AdminDashboard';
import ReflectionJournal from './components/ReflectionJournal';
import SuperEnhancedReflectionJournal from './components/SuperEnhancedReflectionJournal';
import EvidenceOfGrowth from './components/EvidenceOfGrowth';
import EnhancedEvidenceOfGrowth from './components/EnhancedEvidenceOfGrowth';
import TeacherStudentChat from './pages/TeacherStudentChat';
import TeacherStudentView from './components/TeacherStudentView';
import StudentAnalyticsPage from './pages/StudentAnalyticsPage';
import QuizResults from './components/QuizResults';

// Import components
import Layout from './components/Layout';
// import ResponsiveLayout from './components/ResponsiveLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/beautiful" element={<BeautifulDashboard />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Home Routes */}
        <Route 
          path="/" 
          element={
            user.role === 'student' ? (
              <ProtectedRoute allowedRoles={['student']}>
                <StudentHome />
              </ProtectedRoute>
            ) : (
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherHome />
              </ProtectedRoute>
            )
          } 
        />

        {/* Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            user.role === 'student' ? (
              <ProtectedRoute allowedRoles={['student']}>
                <EnhancedStudentDashboard />
              </ProtectedRoute>
            ) : (
              <ProtectedRoute allowedRoles={['teacher']}>
                <EnhancedTeacherDashboard />
              </ProtectedRoute>
            )
          } 
        />
        
        {/* Enhanced Student Dashboard */}
        <Route 
          path="/enhanced-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EnhancedStudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Enhanced Teacher Dashboard */}
        <Route 
          path="/enhanced-teacher-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <EnhancedTeacherDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Common Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resources" 
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assignments" 
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quizzes" 
          element={
            <ProtectedRoute>
              <Quizzes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assignment/:id" 
          element={
            <ProtectedRoute>
              <AssignmentSubmission />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:id/take" 
          element={
            <ProtectedRoute>
              <TakeQuiz />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/submissions" 
          element={
            <ProtectedRoute>
              <Submissions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reflection-journal" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SuperEnhancedReflectionJournal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/evidence-of-growth" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EnhancedEvidenceOfGrowth />
            </ProtectedRoute>
          } 
        />

        {/* Teacher-specific Routes */}
        <Route 
          path="/create-quiz" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateQuiz />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher-chat" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherStudentChat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/student/:studentId" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherStudentView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher/student/:studentId/analytics" 
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <StudentAnalyticsPage />
            </ProtectedRoute>
          } 
        />

        {/* Quiz Routes */}
        <Route 
          path="/quiz/:id" 
          element={
            <ProtectedRoute>
              <QuizDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:id/results" 
          element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <ToastProvider>
              <AppRoutes />
              <RealTimeNotificationPopup />
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
