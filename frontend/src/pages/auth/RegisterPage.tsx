import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BrandLogo } from "../../components/common/BrandLogo";
import { LandingThreeCanvas } from "../../components/landing/LandingThreeCanvas";
import { authApi } from "../../services/api/auth.api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import {
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role] = useState("CUSTOMER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Mouse parallax state for 3D floating graphics
  const [mouseOffset, setMouseOffset] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMouseOffset({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Full name is required");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Valid business email is required");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Please accept terms & conditions");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (res.success) {
        toast.success(`Welcome to DealFlow360, ${name.trim()}!`);
        if (role === "CUSTOMER") {
          navigate("/portal");
        } else {
          navigate("/dashboard");
        }
      } else {
        setErrorMsg(res.error || "Failed to create account");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen min-h-[100dvh] bg-[#fcfcfd] flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-[#252733] font-sans relative overflow-hidden selection:bg-[#714b67] selection:text-white"
    >
      {/* 3D Three.js Interactive Canvas Background */}
      <LandingThreeCanvas />

      {/* Organic Soft Glowing Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#714b67]/15 via-[#caa5c4]/20 to-transparent blur-[80px]" />
        <div className="absolute -right-20 top-1/3 w-[460px] h-[460px] rounded-full bg-gradient-to-bl from-[#714b67]/15 via-[#a855f7]/15 to-transparent blur-[90px]" />

        {/* Top left decorative dot grid */}
        <div className="absolute left-16 top-24 opacity-30 hidden lg:grid grid-cols-5 gap-2.5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#714b67]" />
          ))}
        </div>

        {/* Curved Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 hidden md:block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 50 250 Q 250 150 400 350 T 800 300 T 1200 450"
            fill="none"
            stroke="#714b67"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle cx="400" cy="350" r="4" fill="#714b67" />
          <circle cx="800" cy="300" r="3" fill="#714b67" />
        </svg>
      </div>

      {/* Main Container framed by 3D Elements */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-4 sm:px-6">
        {/* Left Floating 3D Graphic (Desktop) */}
        <div
          className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center gap-4 transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translate3d(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px, 0) rotate(-6deg)`,
          }}
        >
          <div className="w-60 p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl shadow-[#714b67]/15 space-y-4">
            <div className="flex items-end justify-between h-24 gap-2 pt-2 px-1">
              <div className="w-full bg-[#f5eff3] rounded-t-lg h-[40%]" />
              <div className="w-full bg-[#caa5c4] rounded-t-lg h-[65%]" />
              <div className="w-full bg-[#925f84] rounded-t-lg h-[85%]" />
              <div className="w-full bg-[#714b67] rounded-t-lg h-[100%]" />
            </div>
            <div className="space-y-1.5">
              <div className="w-3/4 h-2 bg-slate-200 rounded-full" />
              <div className="w-1/2 h-2 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* Center Register Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto space-y-5">
          <div className="text-center space-y-3">
            <div
              className="flex justify-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <BrandLogo size="lg" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Create your enterprise commercial account
            </p>
          </div>

          <Card className="border-white/80 bg-white/90 backdrop-blur-xl shadow-2xl shadow-[#714b67]/10 rounded-2xl p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[#252733] font-semibold block mb-1.5 font-sans">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Davis"
                  leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  className="bg-[#f8fafc]/90 border-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[#252733] font-semibold block mb-1.5 font-sans">
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan.davis@enterprise.com"
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  className="bg-[#f8fafc]/90 border-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[#252733] font-semibold block mb-1.5 font-sans">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                    className="bg-[#f8fafc]/90 border-slate-200 text-xs pr-9 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[#252733] font-semibold block mb-1.5 font-sans">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
                  className="bg-[#f8fafc]/90 border-slate-200 text-xs font-mono"
                  required
                />
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#714b67]"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to the DealFlow360 Enterprise Terms of Service and
                  Privacy Policy.
                </span>
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 shadow-md shadow-[#714b67]/20 rounded-xl bg-[#714b67] hover:bg-[#5e3c54] text-white py-2.5 font-semibold text-xs transition-all duration-200 active:scale-95"
              >
                <span>
                  {isLoading
                    ? "Creating Account..."
                    : "Create DealFlow360 Account"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-[#714b67] hover:underline"
              >
                Sign In
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Floating 3D Graphic (Desktop) */}
        <div
          className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center gap-4 transition-transform duration-300 ease-out pointer-events-none relative"
          style={{
            transform: `translate3d(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 0) rotate(6deg)`,
          }}
        >
          <div className="absolute -top-6 -right-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg text-[#714b67]">
            <BarChart2 className="w-4 h-4" />
          </div>

          <div className="w-60 p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl shadow-[#714b67]/15 space-y-4">
            <div className="flex items-center justify-center py-1">
              <svg
                className="w-20 h-20 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-[#f5eff3]"
                  strokeWidth="4.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#714b67]"
                  strokeDasharray="68, 100"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-slate-200 rounded-full" />
              <div className="w-3/5 h-2 bg-slate-100 rounded-full" />
            </div>
          </div>

          <div className="self-end p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg text-[#714b67]">
            <FileText className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
