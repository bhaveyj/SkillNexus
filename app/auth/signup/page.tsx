"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AuthInput({
  id, label, type = "text", value, onChange,
  required, minLength, placeholder,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  minLength?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required} minLength={minLength} placeholder={placeholder}
        className={[
          "w-full px-4 py-2.5 rounded-xl text-sm text-foreground",
          "bg-white/[0.04] border border-white/[0.08]",
          "placeholder:text-foreground/20",
          "focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15",
          "hover:border-white/[0.14] transition-all duration-200",
        ].join(" ")}
      />
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />;
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const colors = ["bg-rose-500", "bg-orange-500", "bg-amber-400", "bg-lime-400", "bg-emerald-400"];
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={[
            "flex-1 h-0.5 rounded-full transition-all duration-300",
            i < score ? colors[score - 1] : "bg-white/[0.08]",
          ].join(" ")} />
        ))}
      </div>
      <span className={`text-[10px] font-semibold shrink-0 ${score <= 1 ? "text-rose-400" : score <= 2 ? "text-amber-400" : "text-emerald-400"
        }`}>
        {labels[score - 1] ?? ""}
      </span>
    </div>
  );
}

function OAuthButton({
  loading, onClick, icon, label, accentColor,
}: {
  loading: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; accentColor: string;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={loading}
      className={[
        "group relative flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl text-sm font-medium overflow-hidden",
        "bg-white/[0.04] border border-white/[0.08] text-foreground/60",
        "hover:text-foreground hover:border-white/[0.18]",
        `hover:shadow-lg ${accentColor}`,
        "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
      {loading ? <Spinner /> : (
        <>
          <span className="relative z-10">{icon}</span>
          <span className="relative z-10">{label}</span>
        </>
      )}
    </button>
  );
}

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false); return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const result = await signIn("credentials", { email, password, redirect: false });
        router.push(result?.ok ? "/dashboard" : "/auth/signin");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  const handleOAuth = (provider: string) => {
    setOauthLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative h-screen bg-[#080612] flex flex-col overflow-hidden">

      <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-violet-700/12 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-8%] w-[400px] h-[400px] rounded-full bg-rose-600/8 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-35 pointer-events-none" />

      <header className="relative z-10 shrink-0 border-b border-white/[0.05] bg-[#080612]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-violet-500/20 blur group-hover:blur-md transition-all" />
              <img src="/logo.svg" alt="SkillNexus" className="relative h-7 w-7" />
            </div>
            <span className="font-bold text-[15px] gradient-text-violet">SkillNexus</span>
          </Link>
          <Link href="/" className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-md animate-fade-in-up">

          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent" />
            <div className="absolute inset-0 rounded-2xl border border-white/[0.08]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="relative px-8 py-7 space-y-4">

              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <OAuthButton
                  loading={oauthLoading === "google"}
                  onClick={() => handleOAuth("google")}
                  icon={<GoogleIcon />} label="Google"
                  accentColor="hover:shadow-blue-500/10"
                />
                <OAuthButton
                  loading={oauthLoading === "github"}
                  onClick={() => handleOAuth("github")}
                  icon={<GitHubIcon />} label="GitHub"
                  accentColor="hover:shadow-white/5"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-[11px] text-foreground/25 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <AuthInput id="name" label="Full Name" value={name} onChange={setName}
                  placeholder="John Doe" required />
                <AuthInput id="email" label="Email" type="email" value={email} onChange={setEmail}
                  placeholder="you@example.com" required />

                <div>
                  <AuthInput id="password" label="Password" type="password"
                    value={password} onChange={setPassword}
                    placeholder="Min. 6 characters" required minLength={6} />
                  <PasswordStrength password={password} />
                </div>

                <AuthInput id="confirmPassword" label="Confirm Password" type="password"
                  value={confirmPassword} onChange={setConfirmPassword}
                  placeholder="••••••••" required minLength={6} />

                {error && (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-400 text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-10 text-sm font-semibold" disabled={loading}>
                  {loading ? <Spinner /> : "Create account"}
                </Button>
              </form>

              <div className="space-y-2 pt-1">
                <p className="text-[10px] text-center text-foreground/25 leading-relaxed">
                  By signing up you agree to our{" "}
                  <a href="#" className=" hover:text-foreground/50 transition-colors">Terms</a>
                  {" "}and{" "}
                  <a href="#" className=" hover:text-foreground/50 transition-colors">Privacy Policy</a>
                </p>
                <p className="text-center text-sm text-foreground/35">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}