import React, { useState, useEffect, useRef } from 'react'
import { FaEye, FaEyeSlash, FaTimes, FaArrowLeft, FaKey } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthModalVisual from '../../components/AuthModalVisual.jsx';

function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // OTP entry states
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Refs for the 6 OTP input elements
    const otpRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    // Resend countdown timer logic
    useEffect(() => {
        let timer;
        if (step === 'otp' && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [step, resendTimer]);

    // Step 1: Submit Email to get OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/forgot-password-send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success === false) {
                toast.error(data.message);
                return setErrorMessage(data.message);
            }
            setLoading(false);
            if (res.ok) {
                toast.success('Verification OTP code sent to your email');
                setStep('otp');
                setResendTimer(30);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                // Autofocus first input box after short delay
                setTimeout(() => {
                    if (otpRefs[0].current) otpRefs[0].current.focus();
                }, 100);
            }
        } catch (error) {
            setErrorMessage(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // OTP Change handler
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return; // Allow numbers only
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto focus next box
        if (value && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    // Backspace & keydown navigation handler
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                otpRefs[index - 1].current.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            otpRefs[index - 1].current.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    // Paste handler for fast flow validation
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
            const newOtp = pasteData.split('');
            setOtp(newOtp);
            otpRefs[5].current.focus();
        }
    };

    // Step 2: Verify OTP with backend before showing reset password form
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            toast.error('Please enter the full 6-digit OTP code');
            return;
        }

        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/forgot-password-verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success === false || !res.ok) {
                toast.error(data.message || 'Invalid verification code');
                setErrorMessage(data.message || 'Invalid verification code');
                return;
            }
            toast.success('OTP verified');
            setStep('reset');
        } catch (error) {
            setErrorMessage(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Call Reset Password endpoint
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!password) {
            toast.error('Please enter a new password');
            return;
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            const errorMsg = 'Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.';
            toast.error(errorMsg);
            return setErrorMessage(errorMsg);
        }

        const otpCode = otp.join('');

        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/forgot-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode, password }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success === false || !res.ok) {
                toast.error(data.message);
                setErrorMessage(data.message);
                if (data.message?.toLowerCase().includes('otp') || data.message?.toLowerCase().includes('verification')) {
                    setStep('otp');
                }
                return;
            }
            toast.success('Password reset successfully! Please sign in.');
            navigate('/signin');
        } catch (error) {
            setErrorMessage(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP API call
    const handleResendOtp = async () => {
        if (!canResend) return;
        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/forgot-password-send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success === false) {
                toast.error(data.message);
                return;
            }
            toast.success('New OTP verification code sent to your email');
            setResendTimer(30);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            if (otpRefs[0].current) otpRefs[0].current.focus();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden uppercase">
            <div className="relative w-full max-w-6xl h-[min(92vh,800px)] bg-card rounded-lg shadow-2xl flex overflow-hidden">

                {/* Close Button */}
                <Link to="/" className="absolute top-6 right-6 z-50 text-muted-foreground hover:text-foreground transition-colors bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                    <FaTimes className="h-5 w-5" />
                </Link>

                <AuthModalVisual />

                {/* Right Section: Interactive Forms */}
                <div className="w-full lg:w-[52%] h-full flex flex-col items-center justify-start py-10 px-8 md:p-14 overflow-y-auto custom-scrollbar bg-card">
                    <div className="w-full max-w-sm space-y-8 my-auto">
                        
                        {step === 'email' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-serif tracking-[0.3em] uppercase text-foreground">Reset Password</h2>
                                    <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
                                        Enter your email and we'll send you an OTP to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="relative group">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value.trim())}
                                            className="w-full border border-border px-4 py-4 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-primary-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </form>

                                <div className="pt-6 text-center border-t border-border">
                                    <p className="text-[9px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                                        Remember password?
                                        <Link to="/signin" className="ml-2 text-foreground border-b border-primary hover:pb-1 transition-all">Sign In</Link>
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 'otp' && (
                            <div className="space-y-8 animate-fade-in">
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="flex items-center text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors space-x-2 tracking-widest uppercase mb-4"
                                >
                                    <FaArrowLeft /> <span>Back to Edit Info</span>
                                </button>

                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-serif tracking-[0.3em] uppercase text-foreground">Verify Email</h2>
                                    <p className="text-muted-foreground text-[10px] leading-relaxed tracking-widest uppercase px-2">
                                        We have sent a 6-digit OTP code to <span className="text-foreground font-bold font-mono">{email}</span>.
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-8">
                                    <div className="flex justify-between items-center gap-2 md:gap-3 px-2">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                ref={otpRefs[idx]}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                                onPaste={idx === 0 ? handleOtpPaste : undefined}
                                                className="w-12 h-14 md:w-14 md:h-16 border-b-2 border-border focus:border-primary text-center text-xl md:text-2xl font-bold bg-transparent outline-none transition-all uppercase rounded-none"
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            className="w-full bg-primary text-primary-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300"
                                            disabled={loading}
                                        >
                                            Verify Code
                                        </button>

                                        <div className="text-center pt-2">
                                            {canResend ? (
                                                <button
                                                    type="button"
                                                    onClick={handleResendOtp}
                                                    className="text-[9px] font-bold text-foreground border-b border-primary hover:pb-1 tracking-widest uppercase transition-all"
                                                >
                                                    Resend Code
                                                </button>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <span className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">
                                                        Resend Code in <span className="text-foreground font-mono font-bold">{resendTimer}s</span>
                                                    </span>
                                                    <div className="w-24 h-[2px] bg-secondary overflow-hidden relative">
                                                        <div 
                                                            className="h-full bg-primary absolute left-0 top-0 transition-all duration-1000 ease-linear"
                                                            style={{ width: `${(resendTimer / 30) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 'reset' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-serif tracking-[0.3em] uppercase text-foreground">New Password</h2>
                                    <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
                                        Create a secure new password for your account.
                                    </p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="relative group">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value.trim())}
                                                className="w-full border border-border px-4 py-4 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value.trim())}
                                                className="w-full border border-border px-4 py-4 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirmPassword ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-primary-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300"
                                        disabled={loading}
                                    >
                                        {loading ? 'Resetting Password...' : 'Reset Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 p-4 text-[9px] font-bold border border-red-100 uppercase tracking-widest text-center">
                                {errorMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    )
}

export default ForgotPassword;
