import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "../components/AuthProvider";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthState();

  /* ── Room state ── */
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── Form toggle ── */
  const [showForm, setShowForm] = useState(false);

  /* ── Student form state ── */
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  /* ── Students list state ── */
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  /* ── Fetch room ── */
  useEffect(() => {
    if (!roomId || !db || !user) return;

    async function fetchRoom() {
      try {
        const snap = await getDoc(doc(db, "rooms", roomId));
        if (!snap.exists()) {
          setError("Classroom not found.");
        } else if (snap.data().teacherId !== user.uid) {
          setError("You don't have access to this classroom.");
        } else {
          setRoom({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Fetch room error:", err);
        setError("Failed to load classroom.");
      } finally {
        setLoading(false);
      }
    }

    fetchRoom();
  }, [roomId, user]);

  /* ── Realtime students listener ── */
  useEffect(() => {
    if (!roomId || !db || !user) {
      setStudentsLoading(false);
      return;
    }

    const q = query(
      collection(db, "students"),
      where("roomId", "==", roomId),
      where("teacherId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort client-side: newest first
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });
        setStudents(list);
        setStudentsLoading(false);
      },
      (err) => {
        console.error("Students listener error:", err);
        setStudentsLoading(false);
      }
    );

    return unsubscribe;
  }, [roomId, user]);

  /* ── Add student ── */
  async function handleAddStudent(e) {
    e.preventDefault();
    setFormError("");

    if (!studentName.trim()) {
      setFormError("Student name is required.");
      return;
    }
    if (!db) {
      setFormError("Firestore is not configured.");
      return;
    }

    setAdding(true);
    try {
      await addDoc(collection(db, "students"), {
        teacherId: user.uid,
        roomId,
        name: studentName.trim(),
        phone: phone.trim(),
        parentPhone: parentPhone.trim(),
        createdAt: serverTimestamp(),
      });
      setStudentName("");
      setPhone("");
      setParentPhone("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Add student error:", err);
      setFormError("Failed to add student. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
          <p className="text-xs text-surface-400">Loading classroom…</p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center mx-auto mb-4 text-3xl">
            ⚠️
          </div>
          <p className="text-sm font-medium text-surface-700 mb-1">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold
                       hover:bg-primary-600 transition-colors cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                id="back-to-dashboard-btn"
                onClick={() => navigate("/dashboard")}
                className="w-9 h-9 rounded-xl bg-surface-50 border border-surface-100
                           flex items-center justify-center text-surface-400 hover:text-surface-600
                           hover:bg-surface-100 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div>
                <h1 className="text-base font-bold text-surface-800 tracking-tight leading-tight">
                  {room.roomName}
                </h1>
                <p className="text-xs text-surface-400">
                  {studentsLoading
                    ? "Loading…"
                    : `${students.length} student${students.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Add Student toggle button */}
              <button
                id="toggle-add-student-btn"
                onClick={() => setShowForm(!showForm)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           transition-all duration-200 cursor-pointer active:scale-[0.98]
                           ${showForm
                             ? "bg-surface-100 text-surface-600 hover:bg-surface-200"
                             : "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20 hover:from-primary-600 hover:to-primary-700"
                           }`}
              >
                {showForm ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Student
                  </>
                )}
              </button>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
                <span className="text-base font-extrabold text-white leading-none">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Room Header */}
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 sm:p-8 text-white
                     shadow-lg shadow-primary-500/20 animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl">
                🏫
              </div>
              <div>
                <h2 className="text-xl font-bold">{room.roomName}</h2>
                <p className="text-primary-100 text-sm mt-0.5">
                  Created{" "}
                  {room.createdAt?.toDate
                    ? room.createdAt.toDate().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "recently"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center px-4 py-2 rounded-xl bg-white/10">
                <p className="text-2xl font-extrabold">{students.length}</p>
                <p className="text-primary-200 text-xs">
                  {students.length === 1 ? "Student" : "Students"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Add Student Form (collapsible) ─── */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6 animate-fade-in">
            <h3 className="text-base font-semibold text-surface-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Add New Student
            </h3>

            <form onSubmit={handleAddStudent} id="add-student-form">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="student-name" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Student Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => { setStudentName(e.target.value); setFormError(""); }}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                               text-surface-800 text-sm placeholder:text-surface-300
                               focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                               transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="student-phone" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="student-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                               text-surface-800 text-sm placeholder:text-surface-300
                               focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                               transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="parent-phone" className="block text-sm font-medium text-surface-700 mb-1.5">
                    Parent Phone Number
                  </label>
                  <input
                    id="parent-phone"
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="e.g. 9123456780"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                               text-surface-800 text-sm placeholder:text-surface-300
                               focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                               transition-all duration-200"
                  />
                </div>
              </div>

              {formError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-danger-500/5 border border-danger-400/20 px-4 py-2.5 text-sm text-danger-600 animate-fade-in">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}

              {showSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-accent-400/10 border border-accent-400/30 px-4 py-2.5 text-sm text-accent-600 animate-fade-in">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>Student added successfully!</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  id="add-student-btn"
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600
                             text-white font-semibold text-sm
                             hover:from-primary-600 hover:to-primary-700
                             focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-all duration-200 shadow-md shadow-primary-500/20
                             active:scale-[0.98] cursor-pointer"
                >
                  {adding ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Adding…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Student
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(""); }}
                  className="px-5 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                             text-sm font-medium text-surface-500 hover:bg-surface-100
                             transition-all duration-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Students Table ─── */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-surface-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              Students
            </h3>
            <span className="text-xs text-surface-300 font-medium">
              {students.length} total
            </span>
          </div>

          {studentsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
                <p className="text-xs text-surface-400">Loading students…</p>
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4 text-3xl">
                👨‍🎓
              </div>
              <p className="text-sm font-medium text-surface-500">No students yet</p>
              <p className="text-xs text-surface-300 mt-1 mb-4">
                Click "Add Student" above to enrol your first student.
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold
                             hover:bg-primary-100 transition-all duration-200 cursor-pointer"
                >
                  + Add First Student
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/50">
                    <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Parent Phone</th>
                    <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-surface-50/60 transition-colors duration-150">
                      <td className="px-6 py-3.5 text-xs text-surface-300 font-medium">{i + 1}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-600 shrink-0">
                            {s.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-surface-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-surface-500">
                        {s.phone || <span className="text-surface-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-surface-500">
                        {s.parentPhone || <span className="text-surface-300">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-surface-400">
                        {s.createdAt?.toDate
                          ? s.createdAt.toDate().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
