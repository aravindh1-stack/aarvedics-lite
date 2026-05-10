import { motion } from "framer-motion";
import { ArrowRight, School, Users, Shield, CircleCheck as CheckCircle2, Star, Zap, ChartBar as BarChart3, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  {
    icon: School,
    title: "Create Classrooms",
    description: "Organize courses, schedules and resources per classroom with a clean, intuitive interface.",
  },
  {
    icon: Users,
    title: "Add & Manage Students",
    description: "Track student profiles, attendance and progress in one place. No more scattered spreadsheets.",
  },
  {
    icon: Shield,
    title: "Secure Cloud Access",
    description: "All your data is encrypted and stored securely. Access it from anywhere, anytime.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor student performance and classroom metrics at a glance with real-time dashboards.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Get started in minutes. No complex configuration needed. Just sign up and go.",
  },
  {
    icon: Globe,
    title: "Access Anywhere",
    description: "Works on any device with a modern browser. Your classroom is always within reach.",
  },
];

const testimonials = [
  {
    name: "Priya M.",
    role: "Physics Tutor",
    quote: "Finally, a simple tool that replaces my WhatsApp groups and Excel sheets. My students love it.",
  },
  {
    name: "Rahul S.",
    role: "Mathematics Teacher",
    quote: "Setup took 2 minutes. I had my first classroom running before my coffee got cold.",
  },
  {
    name: "Anita K.",
    role: "Chemistry Educator",
    quote: "Clean, fast, and exactly what I needed. No bloat, no confusion. Just works.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--surface) 85%, transparent)",
        }}
      >
        <div className="brand-container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-sm font-extrabold text-white leading-none">A</span>
            </div>
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
            >
              AarVedics
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium hidden sm:inline-block transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium hidden sm:inline-block transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Testimonials
            </a>
            <a
              href="/login"
              className="brand-btn-primary text-sm"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="brand-container brand-section relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(900px 500px at 50% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%),
                radial-gradient(600px 400px at 80% 10%, color-mix(in srgb, var(--aarga-blue-glow) 8%, transparent), transparent 50%)
              `,
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-8 md:pt-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  background: "color-mix(in srgb, var(--accent) 8%, var(--surface))",
                  borderColor: "color-mix(in srgb, var(--accent) 20%, var(--border))",
                  color: "var(--accent-hover)",
                }}
              >
                <Star className="w-3 h-3" />
                Now in public beta
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
            >
              Your Private
              <br />
              Digital{" "}
              <span style={{ color: "var(--accent)" }}>Classroom</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base md:text-lg leading-relaxed max-w-lg"
              style={{ color: "var(--text-muted)" }}
            >
              Manage students, classrooms and communication in one secure dashboard. Built for tutors who value simplicity.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center gap-3">
              <a
                href="/login"
                className="brand-btn-primary text-sm px-6 py-3"
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="brand-btn-secondary text-sm px-6 py-3"
              >
                See Features
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex items-center gap-4 pt-2"
            >
              {["No credit card", "Free forever", "2-min setup"].map((text) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            <div
              className="brand-card p-6 md:p-8"
              style={{
                background: "var(--surface)",
                boxShadow: "0 24px 64px -16px rgba(10, 25, 47, 0.12), 0 0 0 1px rgba(255,255,255,0.6) inset",
              }}
            >
              {/* Mock dashboard */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
                  <div
                    className="ml-4 h-5 w-48 rounded-md"
                    style={{ background: "var(--surface-2)" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Classrooms", value: "3", color: "var(--accent)" },
                    { label: "Students", value: "47", color: "var(--aarga-blue-glow)" },
                    { label: "Active", value: "Yes", color: "var(--success)" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-4 border"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {stat.label}
                      </p>
                      <p
                        className="text-xl font-bold mt-1 tabular-nums"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl border p-4 space-y-3"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    Recent Students
                  </p>
                  {["Priya Sharma", "Rahul Verma", "Anita Desai"].map((name, i) => (
                    <div key={name} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background: "color-mix(in srgb, var(--accent) 12%, var(--surface))",
                          color: "var(--accent-hover)",
                        }}
                      >
                        {name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {name}
                      </span>
                      <span
                        className="ml-auto text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {["Just now", "2m ago", "5m ago"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating accent glow */}
            <div
              className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 rounded-full blur-2xl"
              style={{ background: "color-mix(in srgb, var(--accent) 18%, transparent)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="brand-container brand-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="brand-card p-6 md:p-8"
          >
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
            >
              The Problem
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Many tutors still rely on a mix of WhatsApp groups, Excel sheets and phone calls to track students, attendance and payments. This workflow is fragmented, insecure and hard to scale. Important information gets lost in chat threads, and there's no single source of truth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="brand-card p-6 md:p-8"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 25%, var(--border))",
            }}
          >
            <h2
              className="text-xl md:text-2xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
            >
              Our Solution
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              AarVedics Lite gives each tutor their own private dashboard to create classrooms, add students, and communicate securely. All backed by cloud storage with a simple, modern UI that respects your time and focus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="brand-container brand-section">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
          >
            Everything you need to teach
          </h2>
          <p className="mt-2 text-sm md:text-base max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            A focused set of tools designed for real-world tutoring workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="brand-card p-6 group hover:shadow-[0_12px_40px_-12px_rgba(10,25,47,0.1)] transition-all duration-300"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors duration-200"
                style={{
                  background: "color-mix(in srgb, var(--accent) 8%, var(--surface))",
                  borderColor: "color-mix(in srgb, var(--accent) 15%, var(--border))",
                  color: "var(--accent-hover)",
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3
                className="text-sm font-semibold mb-1.5"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="brand-container brand-section">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
          >
            Trusted by educators
          </h2>
          <p className="mt-2 text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
            Hear from tutors who switched to AarVedics Lite.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map(({ name, role, quote }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="brand-card p-6"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5 fill-current"
                    style={{ color: "var(--accent)" }}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                &ldquo;{quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="brand-container brand-section">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="brand-card p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            borderColor: "color-mix(in srgb, var(--accent) 20%, var(--border))",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 -z-0"
            style={{
              background: `
                radial-gradient(600px 300px at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%)
              `,
            }}
          />
          <div className="relative z-10">
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
              style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
            >
              Start using AarVedics Lite today
            </h2>
            <p className="text-sm md:text-base mb-6 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Set up your private tutor dashboard in minutes. Free forever, no credit card required.
            </p>
            <a
              href="/login"
              className="brand-btn-primary text-sm px-8 py-3 inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="border-t mt-8"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="brand-container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-xs font-extrabold text-white leading-none">A</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              AarVedics
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} AarVedics. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Terms
            </a>
            <a
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
