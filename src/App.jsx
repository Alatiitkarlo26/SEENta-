import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthPage from './pages/AuthPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutUsPage from './pages/AboutUsPage';
import PrivacyTermsPage from './pages/PrivacyTermsPage';
import NotFoundPage from './pages/NotFoundPage';
import { AppLoadingSkeleton } from './components/Skeleton';
import './App.css';

function MainContent() {
  const { role, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('student-dashboard');
  const [policyInitialTab, setPolicyInitialTab] = useState('terms');

  // Navigation dispatcher
  const handleNavigate = (tab, subTab = 'terms') => {
    if (tab === 'privacy-terms') {
      setPolicyInitialTab(subTab);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Support direct hash navigation (e.g. #404, #privacy, #terms)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash === '404' || hash === 'not-found') {
        setActiveTab('not-found');
      } else if (hash === 'privacy' || hash === 'terms') {
        handleNavigate('privacy-terms', hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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

  // When logged in, evaluate active tab with fallback to 404
  const knownTabs = ['student-dashboard', 'admin-dashboard', 'about-us', 'privacy-terms'];
  const currentTab = !knownTabs.includes(activeTab)
    ? 'not-found'
    : activeTab === 'about-us' || activeTab === 'privacy-terms'
    ? activeTab
    : role === 'admin'
    ? 'admin-dashboard'
    : activeTab;

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
          <AboutUsPage
            onNavigateBack={() =>
              setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
            }
          />
        )}

        {currentTab === 'privacy-terms' && (
          <PrivacyTermsPage
            initialTab={policyInitialTab}
            onNavigateBack={() =>
              setActiveTab(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
            }
          />
        )}

        {currentTab === 'not-found' && (
          <NotFoundPage
            onNavigateHome={() =>
              handleNavigate(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
            }
            onNavigateToTab={handleNavigate}
          />
        )}
      </main>

      <Footer onNavigateToTab={handleNavigate} />
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
