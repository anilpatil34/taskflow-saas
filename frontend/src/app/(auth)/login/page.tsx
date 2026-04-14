'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Layers, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { details?: string | string[] } } } };
      const msg = error.response?.data?.error?.details;
      setError(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--bg-primary)' }}>
      {/* ─── Left Panel (Branding) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 50%, #0a0a1a 100%)' }}>
        <div className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(circle at 30% 40%, var(--gradient-start), transparent 60%)' }} />
        <div className="relative z-10 px-12 xl:px-16 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Welcome back to<br /><span className="gradient-text">TaskFlow</span>
          </h2>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Your smart task management platform for teams
          </p>
        </div>
      </div>

      {/* ─── Right Panel (Form) ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 sm:mb-10">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))' }}>
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold gradient-text">TaskFlow</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Sign in
          </h1>
          <p className="text-sm sm:text-base mb-6 sm:mb-8" style={{ color: 'var(--text-secondary)' }}>
            Enter your credentials to access your account
          </p>

          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl text-xs sm:text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-10 sm:pl-11"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 sm:pl-11 pr-10 sm:pr-11"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="gradient-btn w-full py-3 sm:py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium" style={{ color: 'var(--accent)' }}>
              Create one
            </Link>
          </p>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl text-[10px] sm:text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Demo credentials:</strong><br />
            Admin: admin@taskflow.com / admin123!<br />
            Member: sarah@taskflow.com / password123!
          </div>
        </div>
      </div>
    </div>
  );
}
