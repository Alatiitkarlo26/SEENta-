import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutUsPage from './pages/AboutUsPage';
import './App.css';

function MainContent() {
  const { role, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('student-dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-theme border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading SEENta System...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render the centered AuthPage with smooth transitions
  if (!isAuthenticated) {
    return (
      <AuthPage
        defaultView="login"
        onAuthSuccess={(loggedUser) => {
          setActiveTab(loggedUser.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
        }}
      />
    );
  }

  // When logged in, render the shell with Navbar, Tab Content, and Footer
  const currentTab = activeTab === 'about-us' ? 'about-us' : (role === 'admin' ? 'admin-dashboard' : activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-theme selection:text-white transition-colors duration-200">
      <Navbar activeTab={currentTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {currentTab === 'student-dashboard' && (
          <StudentDashboardPage onNavigateToTab={setActiveTab} />
        )}

        {currentTab === 'admin-dashboard' && (
          <AdminDashboardPage />
        )}

        {currentTab === 'about-us' && (
          <AboutUsPage />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
