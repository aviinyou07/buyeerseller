import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  Loader2,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  Store,
  MessageCircle,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { loginUser, sendForgotPasswordOtp, resetPassword } from "../api/authApi";
import { useAppText } from "../appText";
import {
  completeAuthSession,
  getApiErrorMessage,
} from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useAppText();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // Steps: 'login', 'forgot-email', 'forgot-reset'
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const otpRefs = useRef([]);

  const cleanEmail = email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 2600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidEmail) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (!password) {
      showToast("Please enter your password.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email: cleanEmail,
        password: password,
      });

      completeAuthSession(response, {
        fullName: "Marketplace User",
        email: cleanEmail,
        role: "buyer",
      });

      showToast(t("loginSuccess"));
      navigate(location.state?.from || "/buy", {
        state: location.state?.contactAction
          ? { contactAction: location.state.contactAction }
          : undefined,
        replace: true,
      });
    } catch (error) {
      showToast(getApiErrorMessage(error, "Invalid email or password."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();

    if (!isValidEmail) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);

    try {
      await sendForgotPasswordOtp({
        email: cleanEmail,
        purpose: "forgot-password",
      });

      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      showToast(`${t("otpSentTo")} ${cleanEmail}.`);
      setStep("forgot-reset");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      showToast("Please enter the complete OTP.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email: cleanEmail,
        otp: enteredOtp,
        newPassword: newPassword,
      });

      showToast("Password reset successfully. Please login.");
      setStep("login");
      setPassword("");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Invalid OTP."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (!pastedOtp.length) return;

    const nextOtp = ["", "", "", "", "", ""];
    pastedOtp.forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    otpRefs.current[Math.min(pastedOtp.length, 6) - 1]?.focus();
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-white text-[#102a43]">
      {toast && (
        <div
          className={`fixed left-1/2 top-4 z-40 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-bold  ${
            toast.type === "error"
              ? "border-red-100 text-red-700"
              : "border-[#ded9ff] text-[#102a43]"
          }`}
        >
          {toast.type === "error" ? (
            <CircleAlert size={20} className="mt-0.5 shrink-0 text-red-500" />
          ) : (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#4d49b9]" />
          )}
          <span className="leading-5">{toast.message}</span>
        </div>
      )}

      <div className="grid h-dvh overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
        <main className="flex h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6 md:py-10 lg:px-10 lg:py-5">
          <section className="w-full max-w-[430px] md:max-w-[500px] lg:max-w-[430px]">
            <div className=" border border-gray-50 bg-white p-5 sm:p-7">
              <div className="mb-7 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-lg bg-[#f1efff] text-[#4d49b9] ring-1 ring-[#ded9ff]">
                  <ShieldCheck size={24} />
                </span>
                <h1 className="mt-5 text-3xl font-black leading-tight text-[#102a43] sm:text-4xl">
                  {step === "login" ? t("welcome") : "Reset Password"}
                </h1>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                  {step === "login" ? t("loginSubtitle") : "Recover your account access"}
                </p>
              </div>

              {step === "login" && (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase text-slate-400">
                      Email address
                    </span>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <Mail size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[#102a43] outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="block text-xs font-black uppercase text-slate-400">
                        Password
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep("forgot-email")}
                        className="text-xs font-bold text-[#4d49b9] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <ShieldCheck size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[#102a43] outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#4d49b9] text-sm font-black text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        {t("login")}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === "forgot-email" && (
                <form className="space-y-4" onSubmit={handleSendForgotOtp}>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase text-slate-400">
                      Email address
                    </span>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <Mail size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[#102a43] outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#4d49b9] text-sm font-black text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("sendingOtp")}
                      </>
                    ) : (
                      <>
                        {t("sendOtp")}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-[#102a43]"
                  >
                    <RotateCcw size={16} />
                    Back to Login
                  </button>
                </form>
              )}

              {step === "forgot-reset" && (
                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase text-slate-400">
                        Verification code
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {cleanEmail}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          ref={(element) => {
                            otpRefs.current[index] = element;
                          }}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          className="aspect-square min-w-0 rounded-lg border border-slate-200 bg-[#fbfaff] text-center text-xl font-black text-[#102a43] outline-none transition focus:border-[#4d49b9] focus:bg-white focus:ring-4 focus:ring-[#f1efff] sm:text-2xl"
                        />
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase text-slate-400">
                      New Password
                    </span>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <ShieldCheck size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-[#102a43] outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>

                  <p className="rounded-lg bg-[#f1efff] px-4 py-3 text-xs font-bold leading-5 text-[#4d49b9] ring-1 ring-[#ded9ff]">
                    {t("otpSentTo")} {cleanEmail}.
                  </p>

                  <button
                    type="submit"
                    disabled={loading || otp.join("").length !== 6 || newPassword.length < 6}
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#4d49b9] text-sm font-black text-white "
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ShieldCheck size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtp(["", "", "", "", "", ""]);
                      setStep("forgot-email");
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-[#102a43]"
                  >
                    <RotateCcw size={16} />
                    Change email
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                {t("noAccount")}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="ml-1 font-black text-[#4d49b9] transition "
                >
                  {t("signup")}
                </button>
              </p>
            </div>
          </section>
        </main>

        <aside className="relative hidden overflow-hidden bg-[#102a43] p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(77,73,185,0.52),rgba(16,42,67,0)_42%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-[#4d49b9]">
                  <Store size={21} />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55">
                    {t("shop")}
                  </p>
                  <p className="text-sm font-black">{t("welcome")}</p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md">
              <div className="rounded-lg bg-white p-4 text-[#102a43] ">
                <div className="aspect-[4/3] rounded-lg bg-[#f1efff] p-4">
                  <div className="grid h-full grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 ">
                      <ShoppingBag className="size-7 text-[#4d49b9]" />
                      <div className="mt-8 h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-14 rounded bg-slate-100" />
                    </div>
                    <div className="rounded-lg bg-[#4d49b9] p-3 text-white">
                      <MessageCircle className="size-7" />
                      <div className="mt-8 h-3 w-20 rounded bg-white/35" />
                      <div className="mt-2 h-3 w-14 rounded bg-white/25" />
                    </div>
                    <div className="col-span-2 flex items-center justify-between rounded-lg bg-white px-4 py-3">
                      <span className="flex items-center gap-2 text-sm font-black">
                        <CheckCircle2 className="size-5 text-[#4d49b9]" />
                        Secure login
                      </span>
                      <span className="rounded-full bg-[#f1efff] px-3 py-1 text-xs font-black text-[#4d49b9]">
                        Protected
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-black leading-tight">
                Buy, sell, and connect with trusted local sellers.
              </h2>
              <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-white/68">
                Sign in with your email and password to continue your marketplace journey.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-black text-white/70">
              <span className="rounded-lg bg-white/10 px-3 py-3 ring-1 ring-white/10">
                Verified
              </span>
              <span className="rounded-lg bg-white/10 px-3 py-3 ring-1 ring-white/10">
                Fast Login
              </span>
              <span className="rounded-lg bg-white/10 px-3 py-3 ring-1 ring-white/10">
                Secure
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Login;
