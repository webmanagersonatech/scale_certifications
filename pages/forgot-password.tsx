import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPasswordRequest } from "../lib/request/authRequest";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email."); return; }
    setLoading(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>

          {!sent ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Forgot your password?</h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 transition"
                      placeholder="admin@sonacassa.com"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 text-sm transition shadow-md shadow-blue-900/20"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                  )}
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
              <p className="text-gray-500 text-sm">A reset link has been sent to <strong>{email}</strong>.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-blue-900 hover:text-blue-700 font-medium transition">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
