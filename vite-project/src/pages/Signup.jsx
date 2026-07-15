import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { sendSignupOtp, verifyRegisterOtp } from "../api/authApi";
import { useAppText } from "../appText";
import {
  completeAuthSession,
  getApiErrorMessage,
} from "../services/authService";

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useAppText();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const otpRefs = useRef([]);

  const cleanPhone = phone.replace(/\D/g, "");
  const cleanEmail = email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 2600);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (fullName.trim().length < 2) {
      showToast(t("enterFullName"), "error");
      return;
    }

    if (!isValidEmail) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    if (cleanPhone.length !== 10) {
      showToast(t("enterValidPhone"), "error");
      return;
    }

    setLoading(true);

    try {
      await sendSignupOtp({
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        purpose: "register",
      });

      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      showToast(`${t("otpSentTo")} ${cleanEmail}.`);
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (otp.join("").length !== 6) {
      showToast("Please enter the complete OTP.", "error");
      return;
    }

    setLoading(true);

    try {
      const user = {
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: "buyer",
      };
      const response = await verifyRegisterOtp({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        otp: otp.join(""),
        password: password,
      });

      completeAuthSession(response, user);

      showToast(t("signupSuccess"));
      navigate("/buy");
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

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedOtp = event.clipboardData
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
          className={`fixed left-1/2 top-4 z-40 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-medium  ${
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
                  <UserRound size={24} />
                </span>
                <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#102a43] sm:text-4xl">
                  {t("createAccount")}
                </h1>
                <p className="mt-3  text-sm font-semibold leading-6 text-slate-500">
                  {t("signupSubtitle")}
                </p>
              </div>

              {step === "details" ? (
                <form className="space-y-4" onSubmit={handleSendOtp}>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase text-slate-400">
                      {t("fullName")}
                    </span>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <UserRound size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#102a43] outline-none placeholder:text-slate-400"
                        placeholder={t("fullName")}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase text-slate-400">
                      Email address
                    </span>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <Mail size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#102a43] outline-none placeholder:text-slate-400"
                        placeholder="name@example.com"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase text-slate-400">
                      {t("phoneNumber")}
                    </span>
                    <span className="flex h-13 items-center overflow-hidden rounded-lg border border-slate-200 bg-[#fbfaff] transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <span className="flex h-full items-center gap-2 border-r border-slate-200 bg-white px-3 text-[#102a43]">
                        <Phone size={18} className="text-[#4d49b9]" />
                        <span className="text-sm font-semibold">+91</span>
                      </span>
                      <input
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#102a43] outline-none placeholder:text-slate-400"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder={t("phoneNumber")}
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase text-slate-400">
                      Password
                    </span>
                    <span className="flex h-13 items-center rounded-lg border border-slate-200 bg-[#fbfaff] px-3 transition focus-within:border-[#4d49b9] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f1efff]">
                      <ShieldCheck size={18} className="shrink-0 text-[#4d49b9]" />
                      <input
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#102a43] outline-none placeholder:text-slate-400"
                        placeholder="Create a password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                    </span>
                  </label>

                  <button
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#4d49b9] text-sm font-semibold text-white "
                    disabled={loading}
                    type="submit"
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
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase text-slate-400">
                        Verification code
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {cleanEmail}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          className="aspect-square min-w-0 rounded-lg border border-slate-200 bg-[#fbfaff] text-center text-xl font-semibold text-[#102a43] outline-none transition focus:border-[#4d49b9] focus:bg-white focus:ring-4 focus:ring-[#f1efff] sm:text-2xl"
                          inputMode="numeric"
                          key={index}
                          maxLength={1}
                          ref={(element) => {
                            otpRefs.current[index] = element;
                          }}
                          type="text"
                          value={digit}
                          onChange={(event) => handleOtpChange(event.target.value, index)}
                          onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="rounded-lg bg-[#f1efff] px-4 py-3 text-xs font-medium leading-5 text-[#4d49b9] ring-1 ring-[#ded9ff]">
                    {t("otpSentTo")} {cleanEmail}.
                  </p>

                  <button
                    className="flex h-13 w-full items-center justify-center gap-2 rounded-lg bg-[#4d49b9] text-sm font-semibold text-white "
                    disabled={loading || otp.join("").length !== 6}
                    type="submit"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("verifying")}
                      </>
                    ) : (
                      <>
                        {t("verifySignup")}
                        <ShieldCheck size={18} />
                      </>
                    )}
                  </button>

                  <button
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-[#102a43]"
                    type="button"
                    onClick={() => {
                      setOtp(["", "", "", "", "", ""]);
                      setStep("details");
                    }}
                  >
                    <RotateCcw size={16} />
                    Edit details
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                {t("haveAccount")}
                <button
                  className="ml-1 font-semibold text-[#4d49b9] "
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  {t("login")}
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                    {t("join")}
                  </p>
                  <p className="text-sm font-semibold">{t("createAccount")}</p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md">
              <div className="rounded-lg bg-white p-4 text-[#102a43]">
                <div className="aspect-[4/3] rounded-lg bg-[#f1efff] p-4">
                  <div className="grid h-full grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 ">
                      <UserRound className="size-7 text-[#4d49b9]" />
                      <div className="mt-8 h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-14 rounded bg-slate-100" />
                    </div>
                    <div className="rounded-lg bg-[#4d49b9] p-3 text-white">
                      <MessageCircle className="size-7" />
                      <div className="mt-8 h-3 w-20 rounded bg-white/35" />
                      <div className="mt-2 h-3 w-14 rounded bg-white/25" />
                    </div>
                    <div className="col-span-2 flex items-center justify-between rounded-lg bg-white px-4 py-3 ">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle2 className="size-5 text-[#4d49b9]" />
                        Secure signup
                      </span>
                      <span className="rounded-full bg-[#f1efff] px-3 py-1 text-xs font-semibold text-[#4d49b9]">
                        OTP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-semibold leading-tight">
                Create your account and start exploring trusted listings.
              </h2>
              <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-white/68">
                Register with your email OTP and keep buying or selling in one place.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-white/70">
              <span className="rounded-lg bg-white/10 px-3 py-3 ring-1 ring-white/10">
                Verified
              </span>
              <span className="rounded-lg bg-white/10 px-3 py-3 ring-1 ring-white/10">
                Fast OTP
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

export default Signup;
