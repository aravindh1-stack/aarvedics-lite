import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isConfigured } from "../firebase";
import { LogIn, UserPlus, Mail, Lock, User, CircleAlert as AlertCircle, ArrowRight, BookOpen, Shield, Users } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

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

    if (isSignUp && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name.trim() });
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

  const features = [
    { icon: BookOpen, label: "Manage Classrooms" },
    { icon: Users, label: "Track Students" },
    { icon: Shield, label: "Secure & Private" },
  ];

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-700 via-primary-800 to-surface-900" />
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <span className="text-lg font-extrabold text-white leading-none">A</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                AarVedics
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                Everything you need
                <br />
                to run your
                <br />
                <span className="text-primary-300">classrooms.</span>
              </h2>
              <p className="mt-4 text-surface-300 text-base leading-relaxed max-w-md">
                A modern platform for educators to manage students, track progress, and streamline classroom operations.
              </p>
            </div>

            <div className="space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-300" />
                  </div>
                  <span className="text-sm text-surface-300 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-surface-500">
            &copy; {new Date().getFullYear()} AarVedics Lite
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px]"
        >
          {/* Mobile brand */}
          <motion.div variants={fadeUp} custom={0} className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20">
                <span className="text-lg font-extrabold text-white leading-none">A</span>
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">
                AarVedics
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-surface-400">
              {isSignUp
                ? "Get started with your free account"
                : "Sign in to your dashboard to continue"}
            </p>
          </motion.div>

          {!isConfigured && (
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-5 rounded-xl bg-warning-50 border border-warning-400/20 px-4 py-3 text-sm"
            >
              <p className="font-semibold text-warning-600 mb-1">Firebase not configured</p>
              <p className="text-xs text-surface-500 leading-relaxed">
                Create a <code className="bg-surface-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file
                with your Firebase credentials. See{" "}
                <code className="bg-surface-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.example</code>.
              </p>
            </motion.div>
          )}

          <motion.div variants={fadeUp} custom={3} className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-surface-700 mb-1.5"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                      <input
                        id="name"
                        type="text"
                        required={isSignUp}
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white
                                   text-surface-800 text-sm placeholder:text-surface-300
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
                                   transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white
                               text-surface-800 text-sm placeholder:text-surface-300
                               focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
                               transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-surface-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white
                               text-surface-800 text-sm placeholder:text-surface-300
                               focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
                               transition-all duration-200"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-400/15 px-4 py-3 text-sm text-danger-600"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary-600
                           text-white font-semibold text-sm
                           hover:bg-primary-700
                           focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200
                           active:scale-[0.98] cursor-pointer
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-50 px-3 text-xs text-surface-300 uppercase tracking-wider font-medium">
                  or
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="mt-6">
            <button
              id="auth-toggle-btn"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="w-full py-2.5 rounded-xl border border-surface-200 bg-white
                         text-sm font-medium text-surface-600
                         hover:bg-surface-50 hover:border-surface-300
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20
                         transition-all duration-200 cursor-pointer"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={6}
            className="text-center text-xs text-surface-300 mt-8"
          >
            &copy; {new Date().getFullYear()} AarVedics Lite. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
