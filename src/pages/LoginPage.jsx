import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isConfigured } from "../firebase";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isConfigured || !auth) {
      setError(
        "Firebase is not configured. Add your credentials to a .env file (see .env.example)."
      );
      return;
    }

    // Validate name on signup
    if (isSignUp && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Create the Firebase Auth account
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 2. Set displayName on the auth profile
        await updateProfile(user, { displayName: name.trim() });

        // 3. Create Firestore user document
        if (db) {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name.trim(),
            email: user.email,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Auth state listener in AuthProvider handles redirect
    } catch (err) {
      const code = err.code || "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25 mb-4">
            <span className="text-2xl font-extrabold text-white leading-none">A</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            AarVedics <span className="text-primary-500">Lite</span>
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            {isSignUp
              ? "Create your account to get started"
              : "Sign in to your dashboard"}
          </p>
        </div>

        {/* Config warning */}
        {!isConfigured && (
          <div className="mb-4 rounded-xl bg-warning-400/10 border border-warning-400/30 px-4 py-3 text-sm text-surface-600 animate-fade-in">
            <p className="font-semibold text-warning-500 mb-1">⚠️ Firebase not configured</p>
            <p className="text-xs text-surface-400 leading-relaxed">
              Create a <code className="bg-surface-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file
              in the project root with your Firebase credentials.
              See <code className="bg-surface-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.example</code> for reference.
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-surface-900/5 border border-surface-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5" id="auth-form">
            {/* Name (signup only) */}
            {isSignUp && (
              <div className="animate-fade-in">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required={isSignUp}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                             text-surface-800 text-sm placeholder:text-surface-300
                             focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                             transition-all duration-200"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                           text-surface-800 text-sm placeholder:text-surface-300
                           focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                           transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                           text-surface-800 text-sm placeholder:text-surface-300
                           focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                           transition-all duration-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-danger-500/5 border border-danger-400/20 px-4 py-3 text-sm text-danger-600 animate-fade-in">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600
                         text-white font-semibold text-sm
                         hover:from-primary-600 hover:to-primary-700
                         focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md shadow-primary-500/20
                         active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {isSignUp ? "Creating account…" : "Signing in…"}
                </span>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-surface-300 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Toggle */}
          <button
            id="auth-toggle-btn"
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full py-2.5 rounded-xl border border-surface-200 bg-surface-50
                       text-sm font-medium text-surface-600
                       hover:bg-surface-100 hover:border-surface-300
                       focus:outline-none focus:ring-2 focus:ring-primary-400/40
                       transition-all duration-200 cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-surface-300 mt-6">
          © {new Date().getFullYear()} AarVedics Lite. All rights reserved.
        </p>
      </div>
    </div>
  );
}
