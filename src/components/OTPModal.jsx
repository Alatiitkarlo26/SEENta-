import { useState, useEffect, useRef } from 'react';
import { Clock, X } from 'lucide-react';
import { otpService } from '../services/otpService';
import OutlookSimulationModal from './OutlookSimulationModal';

export default function OTPModal({ email, recipientName, isOpen, onClose, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showOutlookView, setShowOutlookView] = useState(false);
  const [currentEmailData, setCurrentEmailData] = useState(null);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && email) {
      setDigits(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(300);
      setCanResend(false);
      setResendCooldown(30);

      const latest = otpService.getLatestEmail(email);
      setCurrentEmailData(latest);

      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen, email]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  useEffect(() => {
    if (!isOpen || canResend) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, canResend]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDigitChange = (index, value) => {
    setError('');
    const cleanVal = value.replace(/\D/g, '');

    if (cleanVal.length > 1) {
      const val = cleanVal.slice(-1);
      const newDigits = [...digits];
      newDigits[index] = val;
      setDigits(newDigits);
      if (index < 5 && val) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setDigits(newDigits);

    const focusIdx = Math.min(pasteData.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pasteData.length === 6) {
      handleVerify(pasteData);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    const result = await otpService.verifyOTP(email, code);
    setIsVerifying(false);

    if (result.valid) {
      onVerified();
    } else {
      setError(result.error || 'Invalid code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError('');
    try {
      await otpService.sendOTP(email, recipientName);
      setTimeLeft(300);
      setCanResend(false);
      setResendCooldown(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setCurrentEmailData(otpService.getLatestEmail(email));
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[38px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800 p-8 flex flex-col relative transition-colors">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Clean Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enter Verification Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              We sent a 6-digit OTP code to:
            </p>
            <span className="inline-block mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700">
              {email}
            </span>
          </div>

          {/* 6-Digit Boxes */}
          <div className="flex justify-center gap-2 sm:gap-2.5 my-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-2xl border transition outline-none ${
                  digit
                    ? 'border-theme bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-theme'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-600 focus:border-theme focus:ring-1 focus:ring-theme text-slate-900 dark:text-white'
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-600 dark:text-rose-300 text-center font-medium">
              {error}
            </div>
          )}

          {/* Timer & Resend */}
          <div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>

            <div>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-semibold text-theme hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Resend in {resendCooldown}s</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => handleVerify()}
              disabled={isVerifying || digits.join('').length !== 6 || timeLeft === 0}
              className="w-full py-3.5 px-6 bg-theme hover:bg-theme-hover text-white font-semibold rounded-full text-sm transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </div>
      </div>

      <OutlookSimulationModal
        emailData={currentEmailData}
        isOpen={showOutlookView}
        onClose={() => setShowOutlookView(false)}
        onApplyOTP={(code) => {
          setDigits(code.split('').slice(0, 6));
          handleVerify(code);
        }}
      />
    </>
  );
}
