import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';
import pupLogoAndText from '../assets/PUP-Logo-and-Text.png';
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

  // Handle Login / Step 1 -> Transition to Information Step
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter your PUP webmail and password.');
      return;
    }

    const domainCheck = authService.validateUniversityDomain(loginEmail.trim());
    if (!domainCheck.isValid) {
      setLoginError('Please use your official PUP email (@iskolarngbayan.pup.edu.ph or @pup.edu.ph).');
      return;
    }

    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    if (!loginAgreeTerms) {
      setLoginError('Please agree to the Terms, Privacy Policy and Conditions.');
      return;
    }

    // Carry over email & password, then transition smoothly to information view
    setRegData((prev) => ({
      ...prev,
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword
    }));
    switchView('register');
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
    <div className="relative h-screen max-h-screen w-full flex items-center justify-end overflow-hidden bg-white font-sans selection:bg-[#800000] selection:text-white p-3 sm:p-4 lg:p-5">
      {/* High-Quality Campus Background on White Canvas with 50% Opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-white">
        <img
          src={campusBg}
          alt="PUP Biñan Campus"
          className="w-full h-full object-cover object-center opacity-50 filter contrast-[1.05] saturate-[1.1] scale-[1.01]"
        />
        {/* Soft Light Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/40" />
      </div>

      {/* Top Left PUP Header Brand */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-8 z-20 select-none">
        <img
          src={pupLogoAndText}
          alt="Polytechnic University of the Philippines"
          className="h-10 sm:h-12 w-auto object-contain"
        />
      </div>

      {/* Right Side Main Form Container (Almost as tall as website height, non-scrollable) */}
      <div className="relative z-10 w-full lg:w-[53%] xl:w-[50%] max-w-[650px] h-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] my-auto flex flex-col mr-2 sm:mr-3 lg:mr-5">
        <div
          key={view}
          className={`w-full h-full bg-white rounded-[36px] sm:rounded-[48px] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.18)] border border-neutral-100 p-6 sm:p-10 lg:p-14 flex flex-col justify-center overflow-hidden transition-all ${
            direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'
          }`}
        >
          {view === 'login' ? (
            /* ================= LOGIN VIEW (Exact Minimal Design) ================= */
            <div className="w-full max-w-[450px] sm:max-w-[460px] mx-auto">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-[32px] font-bold text-black tracking-tight leading-snug">
                  Welcome to SEENta
                </h1>
                <p className="mt-1.5 text-xs sm:text-[13px] text-neutral-500 max-w-xs mx-auto leading-relaxed">
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
                  <label className="block text-xs sm:text-[13px] font-semibold text-black mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@iskolarngbayan.pup.edu.ph"
                    className="w-full px-5 py-3 sm:py-3.5 bg-white border border-neutral-300 rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition shadow-2xs"
                  />
                </div>

                {/* Password Field with Eye Toggle */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-black mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-5 pr-12 py-3 sm:py-3.5 bg-white border border-neutral-300 rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-black transition cursor-pointer"
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
                <div className="flex items-center gap-2 pt-0.5 ml-1">
                  <input
                    type="checkbox"
                    id="loginAgreeTerms"
                    checked={loginAgreeTerms}
                    onChange={(e) => setLoginAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-xs border-neutral-300 text-black focus:ring-black cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="loginAgreeTerms"
                    className="text-[11px] sm:text-xs text-black cursor-pointer select-none"
                  >
                    I agree to all Terms, Privacy Policy and Conditions
                  </label>
                </div>

                {/* Sign In Pill Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 sm:py-3.5 px-6 bg-black hover:bg-neutral-900 text-white font-semibold rounded-full text-xs sm:text-sm transition shadow-md disabled:opacity-60 cursor-pointer mt-2 active:scale-[0.99]"
                >
                  {isLoggingIn ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Bottom Inquiries Link */}
              <div className="mt-5 sm:mt-6 text-center">
                <p className="text-[11px] sm:text-xs text-black">
                  Have concerns with your account?{' '}
                  <a href="#" className="text-[#088395] hover:underline font-semibold ml-0.5">
                    Create Inquiry
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* ================= INFORMATION VIEW ("Let's get started!") ================= */
            <div className="w-full max-w-[450px] sm:max-w-[460px] mx-auto">
              {/* Back Navigation Button - Positioned Higher by ~20px */}
              <div className="-mt-8 sm:-mt-11 mb-4 sm:mb-5">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-black hover:text-neutral-600 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Back</span>
                </button>
              </div>

              {/* Heading - Bigger & Moved Upward */}
              <div className="mb-5 sm:mb-6">
                <h1 className="text-3xl sm:text-[36px] font-bold text-black tracking-tight leading-tight">
                  Let&apos;s get started!
                </h1>
                <p className="mt-2 text-xs sm:text-[13px] text-neutral-500 max-w-sm leading-relaxed">
                  The smarter way for PUP Binan students, faculty, and security to report, track, and recover lost items.
                </p>
              </div>

              {/* Information Form */}
              <form onSubmit={handleRegSubmit} className="space-y-4 sm:space-y-4.5">
                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 font-medium text-center animate-shake">
                    {regError}
                  </div>
                )}

                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-black mb-1.5 ml-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={regData.firstName}
                      onChange={handleRegChange}
                      placeholder="First Name"
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-white border border-neutral-300 rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-black mb-1.5 ml-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={regData.lastName}
                      onChange={handleRegChange}
                      placeholder="Last Name"
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-white border border-neutral-300 rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Row 2: Student Number */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-black mb-1.5 ml-1">
                    Student Number
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={regData.studentId}
                    onChange={handleRegChange}
                    placeholder="2024-XXXX"
                    className="w-full px-5 py-3 sm:py-3.5 bg-white border border-neutral-300 rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono shadow-2xs"
                  />
                </div>

                {/* Row 3: Phone Number */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-black mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={regData.contactNumber}
                    onChange={handleRegChange}
                    placeholder="09XXXXXXXXX"
                    className="w-full px-5 py-3 sm:py-3.5 bg-white border border-neutral-300 rounded-full text-xs sm:text-sm text-black placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono shadow-2xs"
                  />
                </div>

                {/* Complete Registration Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full py-3.5 sm:py-4 px-6 bg-black hover:bg-neutral-900 text-white font-semibold rounded-full text-xs sm:text-sm transition shadow-md disabled:opacity-60 cursor-pointer mt-4 active:scale-[0.99]"
                >
                  {isSubmittingReg ? 'Sending Verification Code...' : 'Complete Registration'}
                </button>
              </form>
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
