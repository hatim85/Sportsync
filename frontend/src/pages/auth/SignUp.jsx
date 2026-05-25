import React, { useState, useEffect, useRef } from 'react'
import { FaEye, FaEyeSlash, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.js';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../../redux/slices/userSlice.js';

function SignUp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    
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

    // Circular Stepped Animation State
    const [ringIndex, setRingIndex] = useState(0);
    const ringAssets = [
        "/SR1.png",
        "/SR2.png",
        "/SR3.png",
        "/SR4.png",
        "/SR5.png",
        "/SR6.png",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setRingIndex((prev) => (prev + 1) % ringAssets.length);
        }, 5000); // Wait 5 seconds then step
        return () => clearInterval(interval);
    }, [ringAssets.length]);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(formData.password !== formData.confirmPassword){
            toast.error('Passwords do not match');
            return setErrorMessage('Passwords do not match');
        }
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
            toast.error('Please fill out all fields');
            return setErrorMessage('Please fill out all fields');
        }
        
        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            const errorMsg = 'Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.';
            toast.error(errorMsg);
            return setErrorMessage(errorMsg);
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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
        }
        catch (error) {
            setErrorMessage(error.message);
            toast.error(error.message);
        }
        finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        try {
            dispatch(signInStart());
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const accessToken = await user.getIdToken();

            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/firebasesignin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(signInFailure(data.message));
                toast.error(data.message);
                return;
            }
            if (res.ok) {
                dispatch(signInSuccess(data));
                localStorage.setItem("token", data.token);
                toast.success("Login Successful");
                navigate('/');
            }
        } catch (error) {
            dispatch(signInFailure(error.message));
            toast.error(error.message || "Google Authentication Failed");
        }
    };

    // OTP Change handler
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return; // Allow numbers only
        const newOtp = [...otp];
        // Take only the last character typed
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

    // Verify OTP & Signup Submission
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
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/verify-otp-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otpCode }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success === false) {
                toast.error(data.message);
                return setErrorMessage(data.message);
            }
            setLoading(false);
            if (res.ok) {
                toast.success('Email verified & Account created successfully!');
                navigate('/signin');
            }
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
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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
            <div className="relative w-full max-w-5xl h-[min(90vh,750px)] bg-card rounded-lg shadow-2xl flex overflow-hidden">

                {/* Close Button */}
                <Link to="/" className="absolute top-6 right-6 z-50 text-muted-foreground hover:text-foreground transition-colors bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                    <FaTimes className="h-5 w-5" />
                </Link>

                {/* Left Section: White Background with Right-Bulging Black Circle */}
                <div className="hidden lg:flex relative w-[45%] h-full bg-card overflow-hidden group">
                    {/* Main White Background */}
                    <div className="absolute inset-0 bg-card"></div>

                    {/* Large Black Circle bulging RIGHT into the white area */}
                    <div className="absolute top-1/2 right-[100%] -translate-y-1/2 translate-x-[45%] w-[180%] aspect-square bg-[#1b1b1b] rounded-full"></div>

                    {/* Circular Gallery Area */}
                    <div className="absolute inset-0 flex items-center justify-start pl-10 pointer-events-none">
                        <div className="relative flex items-center justify-center">
                            {ringAssets.map((img, i) => {
                                let diff = i - ringIndex;
                                if (diff > 3) diff -= ringAssets.length;
                                if (diff < -2) diff += ringAssets.length;

                                const radius = 520;
                                const theta = (diff * 21) * (Math.PI / 125); 
                                const ty = -radius * Math.sin(theta);
                                const tx = -(radius - radius * Math.cos(theta)) + 320;

                                const isVisible = Math.abs(diff) <= 1;

                                return (
                                    <div
                                        key={i}
                                        className={`absolute transition-all duration-[1500ms] ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                                        style={{
                                            transform: `translate(${tx}px, ${ty}px) scale(${diff === 0 ? 1.4 : Math.abs(diff) === 1 ? 0.8 : 0.55})`,
                                            zIndex: 10 - Math.abs(diff),
                                            filter: `blur(${Math.abs(diff) * 2}px) brightness(${1 - Math.abs(diff) * 0.4})`
                                        }}
                                    >
                                        <div className="w-64 h-64 flex items-center justify-center p-4">
                                            <img
                                                src={img}
                                                alt={`Equipment ${i}`}
                                                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-pulse-slow"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Section: Multi-step content rendering */}
                <div className="w-full lg:w-[55%] h-full flex flex-col items-center justify-start py-10 px-8 md:p-16 overflow-y-auto custom-scrollbar bg-card">
                    <div className="w-full max-w-sm space-y-8 my-auto">
                        
                        {step === 'form' ? (
                            <>
                                {/* Logo & Header */}
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-serif tracking-[0.3em] uppercase text-foreground">Sportsync</h2>
                                    <p className="text-foreground font-bold text-[10px] tracking-[0.15em] uppercase">Create Your Account</p>
                                </div>

                                {/* Signup Form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                        <div className="relative group">
                                            <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                placeholder="First Name"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full border border-border px-4 py-3 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm"
                                            />
                                        </div>
                                        <div className="relative group">
                                            <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                placeholder="Last Name"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full border border-border px-4 py-3 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full border border-border px-4 py-3 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                            Phone
                                        </label>
                                        <input
                                            type="number"
                                            id="phone"
                                            placeholder="+91..."
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full border border-border px-4 py-3 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 transition-colors group-focus-within:text-foreground">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full border border-border px-4 py-3 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm pr-12"
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
                                                id="confirmPassword"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full border border-border px-4 py-3 text-xs bg-transparent focus:border-primary outline-none transition-all placeholder:text-muted-foreground rounded-sm pr-12"
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
                                        className="w-full bg-primary text-primary-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-md active:scale-[0.98] disabled:bg-gray-300 mt-2"
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Register Now'}
                                    </button>

                                    <div className="relative flex py-1 items-center">
                                        <div className="flex-grow border-t border-border"></div>
                                        <span className="flex-shrink mx-4 text-muted-foreground text-[9px] font-bold tracking-widest uppercase">Or</span>
                                        <div className="flex-grow border-t border-border"></div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleSignUp}
                                        className="w-full border border-primary text-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-[0.98] flex items-center justify-center space-x-3 disabled:bg-secondary"
                                        disabled={loading}
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                        <span>Sign up with Google</span>
                                    </button>
                                </form>

                                {/* Sign In Link */}
                                <div className="pt-6 text-center border-t border-border">
                                    <p className="text-[9px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                                        Already have an account?
                                        <Link to="/signin" className="ml-2 text-foreground border-b border-primary hover:pb-1 transition-all">Sign In</Link>
                                    </p>
                                </div>
                            </>
                        ) : (
                            // OTP Verification Screen
                            <div className="space-y-8 animate-fade-in">
                                <button
                                    type="button"
                                    onClick={() => setStep('form')}
                                    className="flex items-center text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors space-x-2 tracking-widest uppercase mb-4"
                                >
                                    <FaArrowLeft /> <span>Back to Edit Info</span>
                                </button>

                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-serif tracking-[0.3em] uppercase text-foreground">Verify Email</h2>
                                    <p className="text-muted-foreground text-[10px] leading-relaxed tracking-widest uppercase px-2">
                                        We have sent a 6-digit OTP verification code to <span className="text-foreground font-bold font-mono">{formData.email}</span>.
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-8">
                                    {/* 6-Digit OTP inputs wrapper */}
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
                                            {loading ? 'Verifying...' : 'Verify & Sign Up'}
                                        </button>

                                        {/* Resend and timer logic representation */}
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
                                                    {/* Custom sliding timeline visualization */}
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
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
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

export default SignUp;