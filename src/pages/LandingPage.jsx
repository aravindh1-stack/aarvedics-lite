import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-2xl font-extrabold">AarVedics<span className="text-primary-600"> Lite</span></div>
          <nav className="space-x-4">
            <a className="text-sm font-medium text-gray-600 hover:text-gray-900" href="#features">Features</a>
            <a className="text-sm font-medium text-gray-600 hover:text-gray-900" href="#pricing">Pricing</a>
            <a className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-semibold" href="#cta">Start Free</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Your Private Digital Classroom</h1>
            <p className="mt-6 text-lg text-gray-600">Manage students, classrooms and communication in one secure dashboard.</p>
            <div className="mt-8 flex items-center gap-4">
              <a href="#cta" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold shadow">Start Free</a>
              <a href="#features" className="text-sm font-medium text-gray-700">See features →</a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-100 p-8 rounded-2xl shadow-lg">
            <div className="w-full h-64 bg-white rounded-lg border flex items-center justify-center text-gray-400">Preview mockup</div>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-bold">The Problem</h2>
          <p className="mt-4 text-gray-600 max-w-3xl">Many tutors still rely on a mix of WhatsApp, Excel sheets and phone calls to track students, attendance and payments. This workflow is fragmented, insecure and hard to scale.</p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">Our Solution</h2>
          <p className="mt-4 text-gray-600 max-w-3xl">AarVedics Lite gives each tutor their own private dashboard to create classrooms, add students, and communicate securely — all backed by cloud storage and simple, modern UI.</p>
        </section>

        <section id="features" className="mt-12">
          <h3 className="text-xl font-semibold">Features</h3>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="font-bold">Create Classrooms</h4>
              <p className="mt-2 text-sm text-gray-600">Organize courses, schedules and resources per classroom.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="font-bold">Add & Manage Students</h4>
              <p className="mt-2 text-sm text-gray-600">Track student profiles, attendance and progress in one place.</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h4 className="font-bold">Secure Cloud Access</h4>
              <p className="mt-2 text-sm text-gray-600">All your data is stored securely and available from anywhere.</p>
            </div>
          </div>
        </section>

        <section id="cta" className="mt-20 bg-gradient-to-r from-primary-50 to-white p-10 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Start using AarVedics Lite today for free</h3>
            <p className="mt-2 text-gray-600">Set up your private tutor dashboard in minutes.</p>
          </div>
          <div>
            <a href="/login" className="inline-flex px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold">Get Started</a>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-sm text-gray-500">© {new Date().getFullYear()} AarVedics. All rights reserved.</div>
      </footer>
    </div>
  );
}
