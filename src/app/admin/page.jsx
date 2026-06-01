"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, Briefcase, FolderOpen, LogOut, Code, Info, Shield, Mail, RefreshCw, AlertTriangle } from "lucide-react";

import ProfileTab from "./tabs/ProfileTab";
import AboutTab from "./tabs/AboutTab";
import ProjectsTab from "./tabs/ProjectsTab";
import ExperiencesTab from "./tabs/ExperiencesTab";
import ShowcaseTab from "./tabs/ShowcaseTab";

// ─── DevTools detection ───────────────────────────────────────────────────────
function useDevToolsDetection(onDetected) {
  const devtoolsOpen = useRef(false);

  useEffect(() => {
    // Method 1: window size diff (reliable in Chrome)
    const threshold = 160;
    function checkSize() {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if ((widthDiff || heightDiff) && !devtoolsOpen.current) {
        devtoolsOpen.current = true;
        onDetected();
      }
    }

    // Method 2: debugger timing
    function checkDebugger() {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      if (end - start > 100 && !devtoolsOpen.current) {
        devtoolsOpen.current = true;
        onDetected();
      }
    }

    // Method 3: console.log toString trick
    const el = new Image();
    Object.defineProperty(el, 'id', {
      get() {
        if (!devtoolsOpen.current) {
          devtoolsOpen.current = true;
          onDetected();
        }
        return '';
      }
    });

    const sizeInterval = setInterval(checkSize, 500);
    const debugInterval = setInterval(checkDebugger, 3000);

    // Method 4: Block right-click
    const blockContextMenu = (e) => e.preventDefault();
    // Method 5: Block F12, Ctrl+Shift+I/J/C/U, Ctrl+U
    const blockKeys = (e) => {
      const blocked =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['I', 'i'].includes(e.key)); // Mac Cmd+Option+I
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        onDetected();
        return false;
      }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeys);

    return () => {
      clearInterval(sizeInterval);
      clearInterval(debugInterval);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [onDetected]);
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [step, setStep] = useState('password'); // 'password' | 'otp'
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devtoolsBlocked, setDevtoolsBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // DevTools detected → lock screen
  const handleDevToolsDetected = useCallback(() => {
    setDevtoolsBlocked(true);
    // If authenticated, force logout
    fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {});
    setIsAuthenticated(false);
  }, []);

  useDevToolsDetection(handleDevToolsDetected);

  // Check session via a protected endpoint (cookie is httpOnly — can't read client-side)
  useEffect(() => {
    fetch('/api/admin/auth-check')
      .then(res => {
        if (res.ok) setIsAuthenticated(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Step 1: Submit password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.step === 'otp') {
        setStep('otp');
        setOtpMessage(data.message || 'OTP sent to your email.');
        setOtpCountdown(600); // 10 min
        setPassword('');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (data.step === 'done') {
        setIsAuthenticated(true);
        setStep('password');
        setOtp('');
      } else {
        setError(data.error || 'Invalid OTP.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    setStep('password');
  };

  // ── DevTools blocked screen ──
  if (devtoolsBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-sm p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">Developer tools detected. Close DevTools and reload the page.</p>
          <button
            onClick={() => { setDevtoolsBlocked(false); window.location.reload(); }}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Checking session...</span>
        </div>
      </div>
    );
  }

  // ── Login screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 max-w-md w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="size-6 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Admin Portal</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {step === 'password' ? 'Enter your password to continue' : 'Enter the OTP sent to your email'}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'password' ? 'bg-primary' : 'bg-primary'}`} />
            <div className={`flex-1 h-1 rounded-full transition-colors ${step === 'otp' ? 'bg-primary' : 'bg-border'}`} />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Password */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><RefreshCw className="size-4 animate-spin" /> Verifying...</>
                ) : (
                  <><Shield className="size-4" /> Continue</>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                <Mail className="size-4 shrink-0" />
                {otpMessage}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">6-digit OTP</label>
                  {otpCountdown > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Expires in {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                  required
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm text-center tracking-[0.4em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><RefreshCw className="size-4 animate-spin" /> Verifying OTP...</>
                ) : (
                  <><Shield className="size-4" /> Verify & Login</>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setStep('password'); setError(''); setOtp(''); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                ← Back to password
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Authenticated admin panel ──
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/50 bg-card/30 flex flex-col p-4 md:h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <LayoutDashboard className="text-primary size-6" />
          <h1 className="text-xl font-bold">Admin Portal</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>}>
            Profile Settings
          </TabButton>
          <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<Info size={18}/>}>
            About Settings
          </TabButton>
          <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<Code size={18}/>}>
            Projects
          </TabButton>
          <TabButton active={activeTab === 'experience'} onClick={() => setActiveTab('experience')} icon={<Briefcase size={18}/>}>
            Experience
          </TabButton>
          <TabButton active={activeTab === 'showcase'} onClick={() => setActiveTab('showcase')} icon={<FolderOpen size={18}/>}>
            Showcase Gallery
          </TabButton>
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
          >
            View Live Portfolio
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors w-full text-left"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'about' && <AboutTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'experience' && <ExperiencesTab />}
        {activeTab === 'showcase' && <ShowcaseTab />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium w-full text-left ${
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
