import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "../components/AuthProvider";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  ArrowLeft,
  Plus,
  X,
  UserPlus,
  Users,
  Phone,
  PhoneCall,
  AlertCircle,
  CheckCircle2,
  Loader2,
  School,
  Calendar,
  Hash,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function StudentRow({ student, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group hover:bg-surface-50/80 transition-colors duration-150"
    >
      <td className="px-5 py-3.5 text-xs text-surface-400 font-medium tabular-nums w-12">
        {index + 1}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
            {student.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="text-sm font-medium text-surface-800">{student.name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-surface-500">
        {student.phone ? (
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-surface-300" />
            {student.phone}
          </span>
        ) : (
          <span className="text-surface-300">--</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-sm text-surface-500">
        {student.parentPhone ? (
          <span className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-surface-300" />
            {student.parentPhone}
          </span>
        ) : (
          <span className="text-surface-300">--</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-sm text-surface-400">
        {student.createdAt?.toDate
          ? student.createdAt.toDate().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "Just now"}
      </td>
    </motion.tr>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-5 py-3.5"><div className="h-3 w-6 rounded skeleton" /></td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg skeleton" />
          <div className="h-3 w-28 rounded skeleton" />
        </div>
      </td>
      <td className="px-5 py-3.5"><div className="h-3 w-20 rounded skeleton" /></td>
      <td className="px-5 py-3.5"><div className="h-3 w-20 rounded skeleton" /></td>
      <td className="px-5 py-3.5"><div className="h-3 w-16 rounded skeleton" /></td>
    </tr>
  );
}

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthState();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <p className="text-xs text-surface-400">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-danger-500" />
          </div>
          <p className="text-sm font-medium text-surface-700 mb-1">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold
                       hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                id="back-to-dashboard-btn"
                onClick={() => navigate("/dashboard")}
                className="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200/60
                           flex items-center justify-center text-surface-400 hover:text-surface-600
                           hover:bg-surface-100 transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-surface-800 tracking-tight leading-tight">
                  {room.roomName}
                </h1>
                <p className="text-xs text-surface-400">
                  {studentsLoading
                    ? "Loading..."
                    : `${students.length} student${students.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="toggle-add-student-btn"
                onClick={() => setShowForm(!showForm)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           transition-all duration-200 cursor-pointer active:scale-[0.98]
                           ${showForm
                             ? "bg-surface-100 text-surface-600 hover:bg-surface-200"
                             : "bg-primary-600 text-white hover:bg-primary-700"
                           }`}
              >
                {showForm ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Student
                  </>
                )}
              </button>

              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-extrabold text-white leading-none">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Room Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-surface-200/60 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <School className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-surface-900">{room.roomName}</h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-surface-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Created{" "}
                  {room.createdAt?.toDate
                    ? room.createdAt.toDate().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "recently"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-5 py-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-2xl font-bold text-surface-900 tabular-nums">{students.length}</p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {students.length === 1 ? "Student" : "Students"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Student Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-surface-200/60 p-6">
                <h3 className="text-sm font-semibold text-surface-800 mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary-600" />
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
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white
                                   text-surface-800 text-sm placeholder:text-surface-300
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
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
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white
                                   text-surface-800 text-sm placeholder:text-surface-300
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
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
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white
                                   text-surface-800 text-sm placeholder:text-surface-300
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
                                   transition-all duration-200"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {formError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mb-4 flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-400/15 px-4 py-2.5 text-sm text-danger-600"
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{formError}</span>
                      </motion.div>
                    )}

                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mb-4 flex items-center gap-2 rounded-xl bg-success-50 border border-success-400/20 px-4 py-2.5 text-sm text-success-600"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Student added successfully!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button
                      id="add-student-btn"
                      type="submit"
                      disabled={adding}
                      className="px-5 py-2.5 rounded-xl bg-primary-600
                                 text-white font-semibold text-sm
                                 hover:bg-primary-700
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all duration-200
                                 active:scale-[0.98] cursor-pointer
                                 flex items-center gap-1.5"
                    >
                      {adding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Student
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setFormError(""); }}
                      className="px-5 py-2.5 rounded-xl border border-surface-200 bg-white
                                 text-sm font-medium text-surface-500 hover:bg-surface-50
                                 transition-all duration-200 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              Students
            </h3>
            <span className="text-xs text-surface-400 font-medium tabular-nums">
              {students.length} total
            </span>
          </div>

          {studentsLoading ? (
            <div className="px-5 py-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Parent Phone</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-surface-300" />
              </div>
              <p className="text-sm font-semibold text-surface-600">No students yet</p>
              <p className="text-xs text-surface-400 mt-1 mb-4">
                Click "Add Student" above to enrol your first student.
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold
                             hover:bg-primary-100 transition-all duration-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add First Student
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/50">
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider w-12">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Student Name</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Phone</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Parent Phone</th>
                    <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {students.map((s, i) => (
                    <StudentRow key={s.id} student={s} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
