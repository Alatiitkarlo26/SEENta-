import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import pupLogoAndText from '../assets/PUP-Logo-and-Text.png';
import OTPModal from '../components/OTPModal';
import TermsPrivacyModal from '../components/TermsPrivacyModal';
import campusBg from '../assets/pup-binan-campus.jpg';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

export default function AuthPage({ defaultView = 'login', onAuthSuccess }) {
  const { login, register } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const [view, setView] = useState(defaultView); // 'login' | 'register'
  const [direction, setDirection] = useState('right'); // 'right' | 'left' for animation

  // Password visibility toggle
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAgreeTerms, setLoginAgreeTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    contactNumber: '',
    email: '',
    password: ''
  });
  const [regError, setRegError] = useState('');
  const [regNotice, setRegNotice] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const switchView = (newView) => {
    setDirection(newView === 'register' ? 'right' : 'left');
    setView(newView);
    setLoginError('');
    setRegError('');
  };

  // Handle Login & Automatic Smart Redirect:
  // - If user has an account: authenticate & redirect to home page
  // - If user does NOT have an account: redirect to register page with email & password pre-filled
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegNotice('');

    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail || !loginPassword) {
      setLoginError('Please enter your PUP webmail and password.');
      return;
    }

    const domainCheck = authService.validateUniversityDomain(cleanEmail);
    if (!domainCheck.isValid) {
      setLoginError('Please use your official PUP email (@iskolarngbayan.pup.edu.ph or @pup.edu.ph).');
      return;
    }

    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    if (!loginAgreeTerms) {
      setLoginError('Please agree to the Terms, Privacy and Conditions.');
      return;
    }

    setIsLoggingIn(true);

    try {
      // 1. Attempt login against backend database
      const loggedUser = await login(cleanEmail, loginPassword);
      setIsLoggingIn(false);

      // If user has an account and credentials match, redirect to their home page
      if (onAuthSuccess) {
        onAuthSuccess(loggedUser);
      }
    } catch (err) {
      setIsLoggingIn(false);

      // 2. If user does NOT have an account, redirect directly to register page
      if (err.notRegistered || err.status === 404 || err.message?.includes('No account registered')) {
        setRegData((prev) => ({
          ...prev,
          email: cleanEmail,
          password: loginPassword
        }));
        setRegNotice(`No account found for "${cleanEmail}". Please complete your registration details below.`);
        switchView('register');
        return;
      }

      // 3. If account exists but password was wrong or other error
      setLoginError(err.message || 'Invalid university email or password.');
    }
  };

  // Handle Registration input changes
  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData((prev) => ({ ...prev, [name]: value }));
    if (regError) setRegError('');
  };

  const validateReg = () => {
    if (!regData.firstName.trim() || !regData.lastName.trim()) {
      setRegError('Please provide your First Name and Last Name.');
      return false;
    }
    if (!regData.studentId.trim()) {
      setRegError('Please enter your Student Number.');
      return false;
    }
    if (!regData.contactNumber.trim()) {
      setRegError('Please enter your contact phone number.');
      return false;
    }
    const phoneCheck = authService.validateContactNumber(regData.contactNumber);
    if (!phoneCheck.isValid) {
      setRegError(phoneCheck.error);
      return false;
    }
    return true;
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!validateReg()) return;

    setIsSubmittingReg(true);
    setRegError('');

    try {
      const fullName = `${regData.lastName.trim()}, ${regData.firstName.trim()}`;
      await otpService.sendOTP(regData.email, fullName);
      setIsSubmittingReg(false);
      setIsOtpModalOpen(true);
    } catch (err) {
      setIsSubmittingReg(false);
      setRegError(err.message || 'Failed to dispatch verification email.');
    }
  };

  const handleOtpVerified = async () => {
    setIsOtpModalOpen(false);
    try {
      const fullName = `${regData.lastName.trim()}, ${regData.firstName.trim()}`;
      const newUser = await register({
        fullName,
        firstName: regData.firstName.trim(),
        lastName: regData.lastName.trim(),
        email: regData.email,
        studentId: regData.studentId.trim(),
        contactNumber: regData.contactNumber.trim(),
        password: regData.password
      });

      if (onAuthSuccess) {
        onAuthSuccess(newUser);
      }
    } catch (err) {
      setRegError(err.message || 'Registration failed after verification.');
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full flex items-center justify-center lg:justify-between overflow-hidden bg-white dark:bg-slate-950 font-sans p-3 sm:p-4 lg:p-6 transition-colors duration-200">
      {/* High-Quality Campus Background on White Canvas with 50% Opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-white dark:bg-slate-950">
        <img
          src={campusBg}
          alt="PUP Biñan Campus"
          className="w-full h-full object-cover object-center opacity-45 dark:opacity-20 filter contrast-[1.05] saturate-[1.1] scale-[1.01]"
        />
        {/* Soft Light / Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-white/50 dark:from-slate-950/95 dark:via-slate-950/70 dark:to-slate-950/50" />
      </div>

      {/* Top Left PUP Header Brand */}
      <div className="absolute top-5 sm:top-6 left-5 sm:left-6 z-20 select-none pointer-events-none shrink-0 flex items-center gap-3">
        <img
          src={pupLogoAndText}
          alt="Polytechnic University of the Philippines"
          draggable={false}
          className="h-10 sm:h-11 w-auto object-contain drop-shadow-xs brightness-100 dark:brightness-110 shrink-0 select-none"
        />
      </div>

      {/* Top Right Quick Controls (Theme Toggle) */}
      <div className="absolute top-5 sm:top-6 right-5 sm:right-6 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMode}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-neutral-200/80 dark:border-slate-800 text-neutral-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition shadow-2xs cursor-pointer active:scale-95"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Left-Side Minimal Editorial Experience (Desktop Only, Keeping Center Open) */}
      <div className="hidden lg:flex flex-col justify-end h-[calc(100vh-2rem)] sm:h-[calc(100vh-2.5rem)] max-h-[880px] my-auto pl-10 xl:pl-16 pr-8 pb-3 z-10 select-none max-w-xl xl:max-w-2xl pointer-events-none">
        <div className="space-y-4">
          <h2 className="text-4xl xl:text-5xl 2xl:text-[54px] font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.12]">
            Reconnecting what was lost <br />
            <span className="text-neutral-500 dark:text-slate-400 font-normal">with who it belongs to.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-slate-400 leading-relaxed font-sans max-w-lg font-normal">
            A digital lost and found management platform built specifically for the students, faculty, and campus security of PUP Biñan.
          </p>
        </div>

        {/* Minimal Bottom Line - positioned at the exact same bottom Y coordinate as the card */}
        <div className="mt-8 pt-5 border-t border-neutral-200/50 dark:border-slate-800/80 flex items-center gap-2.5 text-xs text-neutral-400 dark:text-slate-500 font-sans">
          <span>&copy; {new Date().getFullYear()} SEENta</span>
          <span>&bull;</span>
          <span>PUP Biñan Campus</span>
        </div>
      </div>

      {/* Main Form White Card Container */}
      <div className="relative z-10 w-full sm:w-[560px] md:w-[600px] lg:w-[600px] xl:w-[620px] max-w-[94vw] h-[calc(100vh-2rem)] sm:h-[calc(100vh-2.5rem)] max-h-[880px] my-auto flex flex-col justify-center lg:ml-auto">
        <div
          key={view}
          className={`w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[44px] sm:rounded-[56px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.16)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.6)] border border-neutral-100/90 dark:border-slate-800 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center items-center overflow-hidden transition-all ${
            direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'
          }`}
        >
          {view === 'login' ? (
            /* ================= LOGIN VIEW (Clean Minimal Design) ================= */
            <div className="w-full max-w-[390px] sm:max-w-[410px] mx-auto font-sans">
              {/* Header */}
              <div className="text-center mb-7 sm:mb-8 md:mb-9">
                <h1 className="text-2xl sm:text-[32px] font-bold text-black dark:text-white tracking-tight leading-tight">
                  Welcome to{' '}
                  <span className="inline-flex items-baseline">
                    <span className="font-albert font-black uppercase text-black dark:text-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>SEEN</span>
                    <span className="font-alan font-normal text-[0.96em] text-black dark:text-white ml-0.5" style={{ fontFamily: "'Alan Sans', sans-serif", fontWeight: 400 }}>ta</span>
                  </span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-[13px] text-neutral-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Enter your PUP webmail to begin your search. SEENta&apos;s got your back.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-600 dark:text-rose-300 font-medium text-center animate-shake flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 mb-1.5 ml-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@iskolarngbayan.pup.edu.ph"
                    autoComplete="username"
                    required
                    className="w-full px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme transition shadow-2xs font-sans"
                  />
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1.5 mr-1">
                    <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200">
                      Password
                    </label>
                    <span className="text-[10px] text-neutral-400 dark:text-slate-500 font-mono">
                      Min. 6 characters
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full pl-5 pr-11 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme transition shadow-2xs font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-black dark:hover:text-white transition cursor-pointer"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-center gap-2.5 pt-0.5 ml-1.5">
                  <input
                    type="checkbox"
                    id="loginAgreeTerms"
                    checked={loginAgreeTerms}
                    onChange={(e) => setLoginAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-xs border-neutral-300 text-theme focus:ring-theme cursor-pointer accent-theme shrink-0"
                  />
                  <label
                    htmlFor="loginAgreeTerms"
                    className="text-[11px] sm:text-xs text-black dark:text-slate-300 select-none font-medium cursor-pointer"
                  >
                    I agree to all{' '}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsTermsModalOpen(true);
                        }
                      }}
                      className="underline text-black dark:text-white hover:text-theme dark:hover:text-theme font-semibold cursor-pointer transition-colors"
                    >
                      Terms, Privacy and Conditions
                    </span>
                  </label>
                </div>

                {/* Sign In Pill Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 sm:py-3.5 px-6 bg-theme hover:bg-theme-hover text-white font-semibold rounded-full text-xs sm:text-sm transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer mt-2 active:scale-[0.99] flex items-center justify-center gap-2 tracking-wide font-sans"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Subtle Security & Institutional Trust Footer */}
              <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-slate-500 select-none">
                <Lock className="w-3 h-3 text-neutral-400 dark:text-slate-500" />
                <span>PUP Webmail Authenticated &bull; RA 10173 Protected</span>
              </div>
            </div>
          ) : (
            /* ================= REGISTER VIEW ("Let's get started!") ================= */
            <div className="w-full max-w-[450px] sm:max-w-[460px] mx-auto">
              {/* Back Navigation Button */}
              <div className="mb-4 sm:mb-5">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 hover:text-theme dark:hover:text-theme transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              {/* Heading */}
              <div className="mb-4 sm:mb-5">
                <h1 className="text-2xl sm:text-[32px] font-bold text-black dark:text-white tracking-tight leading-tight">
                  Let&apos;s get started!
                </h1>
                <p className="mt-1.5 text-xs sm:text-[13px] text-neutral-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  The smarter way for PUP Biñan students, faculty, and security to report, track, and recover lost items.
                </p>
              </div>

              {/* Institutional Email Pill Display */}
              {regData.email && (
                <div className="mb-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Creating account for:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-[220px]">
                    {regData.email}
                  </span>
                </div>
              )}

              {/* Informative Notice (e.g. when redirected from login) */}
              {regNotice && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-800 dark:text-amber-200 font-medium text-center animate-fadeIn">
                  {regNotice}
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegSubmit} className="space-y-3.5 sm:space-y-4">
                {regError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-600 dark:text-rose-300 font-medium text-center animate-shake flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* If user came directly without email, allow entering email */}
                {!regData.email && (
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 mb-1.5 ml-1.5">
                      Official PUP Webmail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={regData.email}
                      onChange={handleRegChange}
                      placeholder="name@iskolarngbayan.pup.edu.ph"
                      required
                      className="w-full px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-2 focus:ring-theme/20 transition shadow-2xs font-sans"
                    />
                  </div>
                )}

                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 mb-1.5 ml-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={regData.firstName}
                      onChange={handleRegChange}
                      placeholder="First Name"
                      required
                      className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-2 focus:ring-theme/20 transition shadow-2xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 mb-1.5 ml-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={regData.lastName}
                      onChange={handleRegChange}
                      placeholder="Last Name"
                      required
                      className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-2 focus:ring-theme/20 transition shadow-2xs font-sans"
                    />
                  </div>
                </div>

                {/* Row 2: Student Number */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 mb-1.5 ml-1.5">
                    Student Number
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={regData.studentId}
                    onChange={handleRegChange}
                    placeholder="2024-XXXXX-BN-X"
                    required
                    className="w-full px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme transition font-sans shadow-2xs"
                  />
                </div>

                {/* Row 3: Phone Number */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-black dark:text-slate-200 mb-1.5 ml-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={regData.contactNumber}
                    onChange={handleRegChange}
                    placeholder="09XXXXXXXXX"
                    required
                    className="w-full px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-800/90 border border-neutral-300 dark:border-slate-700 rounded-full text-xs sm:text-[13px] text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme transition font-sans shadow-2xs"
                  />
                </div>

                {/* Complete Registration Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full py-3 sm:py-3.5 px-6 bg-theme hover:bg-theme-hover text-white font-semibold rounded-full text-xs sm:text-sm transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer mt-2 active:scale-[0.99] flex items-center justify-center gap-2 font-sans tracking-wide"
                >
                  {isSubmittingReg ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              </form>

              {/* Already have an account link */}
              <div className="mt-4 text-center">
                <span className="text-[11px] sm:text-xs text-neutral-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-theme hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              </div>

              {/* Subtle Security & Institutional Trust Footer */}
              <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 dark:text-slate-500 select-none">
                <Lock className="w-3 h-3 text-neutral-400 dark:text-slate-500" />
                <span>PUP Webmail Authenticated &bull; RA 10173 Protected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Modern OTP Modal */}
      <OTPModal
        email={regData.email}
        recipientName={`${regData.firstName} ${regData.lastName}`}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerified={handleOtpVerified}
      />

      {/* Terms & Conditions / Privacy Policy Modal Card */}
      <TermsPrivacyModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        isChecked={loginAgreeTerms}
        onToggleCheck={(checked) => setLoginAgreeTerms(checked)}
        onAccept={() => {
          setLoginAgreeTerms(true);
          setIsTermsModalOpen(false);
        }}
      />
    </div>
  );
}
