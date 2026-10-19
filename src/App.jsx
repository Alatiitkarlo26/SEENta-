import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutUsPage from './pages/AboutUsPage';
import { AppLoadingSkeleton } from './components/Skeleton';
import './App.css';

function MainContent() {
  const { role, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('student-dashboard');

  if (loading) {
    return <AppLoadingSkeleton />;
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
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
