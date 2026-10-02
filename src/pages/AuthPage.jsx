import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import PUPLogo from '../components/PUPLogo';
import OTPModal from '../components/OTPModal';
import campusBg from '../assets/pup-binan-campus.jpg';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AuthPage({ defaultView = 'login', onAuthSuccess }) {
  const { login, register } = useAuth();
  const [view, setView] = useState(defaultView); // 'login' | 'register'
  const [direction, setDirection] = useState('right'); // 'right' | 'left' for animation

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAgreeTerms, setLoginAgreeTerms] = useState(false);
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
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const switchView = (newView) => {
    setDirection(newView === 'register' ? 'right' : 'left');
    setView(newView);
    setLoginError('');
    setRegError('');
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter your PUP webmail and password.');
      return;
    }

    if (!loginAgreeTerms) {
      setLoginError('Please agree to the Terms, Privacy Policy and Conditions.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      setIsLoggingIn(false);
      if (onAuthSuccess) {
        onAuthSuccess(loggedUser);
      }
    } catch (err) {
      setIsLoggingIn(false);
      setLoginError(err.message || 'Invalid credentials.');
    }
  };

  // Handle Registration
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
      setRegError('Please enter your Student / Employee Number.');
      return false;
    }
    if (!regData.contactNumber.trim()) {
      setRegError('Please enter your contact phone number.');
      return false;
    }
    if (!regData.email.trim()) {
      setRegError('Please enter your official PUP webmail.');
      return false;
    }

    const domainCheck = authService.validateUniversityDomain(regData.email);
    if (!domainCheck.isValid) {
      setRegError('Please use your official PUP email (@iskolarngbayan.pup.edu.ph or @pup.edu.ph).');
      return false;
    }

    if (!regData.password || regData.password.length < 6) {
      setRegError('Password must be at least 6 characters.');
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
        email: regData.email,
        studentId: regData.studentId,
        contactNumber: regData.contactNumber,
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-slate-900 font-sans selection:bg-[#800000] selection:text-white">
      {/* High-Quality Campus Background with Photographic Color Tuning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={campusBg}
          alt="PUP Biñan Campus"
          className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[1.12] brightness-[0.92] scale-[1.01]"
        />
        {/* Soft Vignette Overlay to Enhance Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/40" />
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[0.5px]" />
      </div>

      {/* Top Left Floating PUP Header Brand */}
      <div className="absolute top-5 left-5 sm:top-8 sm:left-8 z-20 flex items-center gap-3 select-none bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-white/60">
        <PUPLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-xs" />
        <div className="flex flex-col">
          <span className="text-[12px] sm:text-[13px] font-extrabold text-[#800000] tracking-wide leading-tight">
            POLYTECHNIC UNIVERSITY OF THE PHILIPPINES
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-600 tracking-wider">
            THE COUNTRY&apos;S 1ST POLYTECHNICU
          </span>
        </div>
      </div>

      {/* Centered Main Form Container */}
      <div className="relative z-10 w-full max-w-[480px] sm:max-w-[510px] p-4 sm:p-6 my-auto pt-24 sm:pt-6">
        <div
          key={view}
          className={`w-full bg-white/95 backdrop-blur-xl rounded-[38px] sm:rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-white/80 p-7 sm:p-10 lg:p-11 transition-all ${
            direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'
          }`}
        >
          {view === 'login' ? (
            /* ================= LOGIN VIEW (Exact Figma Mockup) ================= */
            <div>
              {/* Header */}
              <div className="text-center mb-7">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to SEENta
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Enter your PUP webmail to begin your search. SEENta&apos;s got your back.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-4.5">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium text-center animate-shake">
                    {loginError}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@iskolarngbayan.pup.edu.ph"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition shadow-xs"
                  />
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
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
                <div className="flex items-center gap-2.5 pt-1 ml-1">
                  <input
                    type="checkbox"
                    id="loginAgreeTerms"
                    checked={loginAgreeTerms}
                    onChange={(e) => setLoginAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="loginAgreeTerms"
                    className="text-[11px] sm:text-xs text-slate-600 cursor-pointer select-none"
                  >
                    I agree to all Terms, Privacy Policy and Conditions
                  </label>
                </div>

                {/* Sign In Pill Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white font-semibold rounded-full text-sm transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer mt-2 active:scale-[0.99]"
                >
                  {isLoggingIn ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Bottom Inquiries & Sign Up Links */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Have concerns with your account?{' '}
                  <a href="#" className="text-sky-600 hover:underline font-medium">
                    Create Inquiry
                  </a>
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className="text-black hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ================= REGISTER VIEW ("Let's get started!") ================= */
            <div>
              {/* Back Navigation Button */}
              <div>
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 hover:text-slate-600 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Back</span>
                </button>
              </div>

              {/* Heading */}
              <div className="mt-3 mb-5">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Let&apos;s get started!
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  The smarter way for PUP Binan students, faculty, and security to report, track, and recover lost items.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleRegSubmit} className="space-y-3.5">
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium text-center animate-shake">
                    {regError}
                  </div>
                )}

                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1 ml-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={regData.firstName}
                      onChange={handleRegChange}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1 ml-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={regData.lastName}
                      onChange={handleRegChange}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Row 2: Student Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 ml-1">
                    Student Number
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={regData.studentId}
                    onChange={handleRegChange}
                    placeholder="2024-XXXX"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition font-mono shadow-xs"
                  />
                </div>

                {/* Row 3: Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={regData.contactNumber}
                    onChange={handleRegChange}
                    placeholder="09XXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition font-mono shadow-xs"
                  />
                </div>

                {/* Row 4: Official PUP Webmail */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 ml-1">
                    PUP Webmail (Outlook)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={regData.email}
                    onChange={handleRegChange}
                    placeholder="name@iskolarngbayan.pup.edu.ph"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition font-mono shadow-xs"
                  />
                </div>

                {/* Row 5: Password with Eye Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      name="password"
                      value={regData.password}
                      onChange={handleRegChange}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Complete Registration Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white font-semibold rounded-full text-sm transition shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer mt-3 active:scale-[0.99]"
                >
                  {isSubmittingReg ? 'Sending Verification Code...' : 'Complete Registration'}
                </button>
              </form>

              {/* Return to Sign in link */}
              <div className="mt-4 text-center">
                <span className="text-[11px] sm:text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="text-black hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
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
    </div>
  );
}
