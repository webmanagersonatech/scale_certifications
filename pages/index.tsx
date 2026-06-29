import { useState } from "react";
import { useRouter } from "next/router";
import { Eye, EyeOff, GraduationCap, Users, Award, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import { loginRequest } from "../lib/request/authRequest";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "sonacassecretkey@2025";

const features = [
  { icon: GraduationCap, label: "Smart Learning", desc: "AI-powered courses tailored to your goals" },
  { icon: Users, label: "Network Growth", desc: "Connect with 50,000+ professionals" },
  { icon: Award, label: "Certifications", desc: "Industry-recognised credentials" },
  { icon: TrendingUp, label: "Career Track", desc: "Step-by-step path to success" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
      const response = await loginRequest(email, encryptedPassword);
      if (response.token) {
        localStorage.setItem("token", response.token);
        if (response.user) localStorage.setItem("user", JSON.stringify(response.user));
        toast.success("Login successful!");
        router.replace("/dashboard");
      } else {
        toast.error("Invalid response from server.");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Left panel – form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Scaleindia</h1>
              <p className="text-sm text-gray-500 mt-0.5">Student Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10 placeholder:text-gray-400"
                placeholder="admin@sonacassa.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-900 hover:text-blue-700 transition"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-900/10 placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-900 hover:bg-blue-800 active:bg-blue-950 disabled:opacity-60 text-white font-semibold py-3 text-sm transition-all shadow-md shadow-blue-900/20 mt-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Scaleindia. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel – promo ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative bg-blue-900 overflow-hidden px-12 py-16">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-800 opacity-50" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-blue-800 opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-800/20" />

        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs font-medium backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Trusted by 500+ institutions
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight">
            Transform Your Future with <span className="text-blue-200">Sona</span>
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            A powerful platform for learning, networking, and career growth — built for the professionals of tomorrow.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {features.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-left hover:bg-white/15 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-blue-200 text-xs mt-0.5 leading-snug">{desc}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/10">
            {[["50K+", "Learners"], ["1.2K", "Courses"], ["98%", "Satisfaction"]].map(([num, lbl]) => (
              <div key={lbl} className="text-center">
                <p className="text-2xl font-bold text-white">{num}</p>
                <p className="text-blue-300 text-xs">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
