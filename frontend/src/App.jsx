import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { ExamProvider } from './context/ExamContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { AlertCircle } from 'lucide-react';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamList from './pages/student/ExamList';
import ExamAttempt from './pages/student/ExamAttempt';
import ResultPage from './pages/student/ResultPage';
import AttemptHistory from './pages/student/AttemptHistory';
import LeaderboardPage from './pages/student/Leaderboard';
import GlobalLeaderboard from './pages/student/GlobalLeaderboard';
import Settings from './pages/student/Settings';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateExam from './pages/admin/CreateExam';
import EditExam from './pages/admin/EditExam';
import ManageQuestions from './pages/admin/ManageQuestions';
import ExamResults from './pages/admin/ExamResults';
import StudentManagement from './pages/admin/StudentManagement';
import AttemptReview from './pages/admin/AttemptReview';
import AdminSettings from './pages/admin/AdminSettings';

// Components
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ExamProvider>
          <Routes>
            {/* Public Routes - No Layout */}
            <Route path="/login" element={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500"><Login /></div>} />
            <Route path="/register" element={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500"><Register /></div>} />
            
            
            {/* Full Screen Exam Experience */}
            <Route path="/exam-portal/:id" element={
              <ProtectedRoute role="student">
                <ExamAttempt />
              </ProtectedRoute>
            } />
            <Route path="/exam/:id" element={
              <ProtectedRoute role="student">
                <ExamAttempt />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Wrapped in MainLayout */}
            <Route path="/student/*" element={
              <ProtectedRoute role="student">
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/exams" element={<ExamList />} />
                    <Route path="/result/:id" element={<ResultPage />} />
                    <Route path="/history" element={<AttemptHistory />} />
                    <Route path="/leaderboard" element={<GlobalLeaderboard />} />
                    <Route path="/leaderboard/:examId" element={<LeaderboardPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
              <ProtectedRoute role="admin">
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/exams/create" element={<CreateExam />} />
                    <Route path="/exams/edit/:id" element={<EditExam />} />
                    <Route path="/exams/questions/:id" element={<ManageQuestions />} />
                    <Route path="/exams/results/:id" element={<ExamResults />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/exams/review/:id" element={<AttemptReview />} />
                    <Route path="/settings" element={<AdminSettings />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/unauthorized" element={
              <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-8">
                  <AlertCircle className="text-red-600 w-10 h-10" />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">403 - <span className="text-red-600">Unauthorized</span></h1>
                <p className="text-gray-500 font-medium mb-10 text-center max-w-md">You do not have the required synchronization credentials to access this administrative segment.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-gray-200"
                >
                  Return to Dashboard
                </button>
              </div>
            } />
            <Route path="*" element={<div className="text-center py-20"><h1 className="text-4xl font-bold">404 - Not Found</h1></div>} />
          </Routes>
        </ExamProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
