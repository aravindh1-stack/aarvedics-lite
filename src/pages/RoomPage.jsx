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
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle2,
  Loader as Loader2,
  School,
  Calendar,
} from "lucide-react";
import { AppShell, FullPageLoader, EmptyState, ErrorBanner } from "../components/layout";

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
      className="group transition-colors duration-150"
      style={{ "--hover-bg": "var(--surface-2)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td className="px-5 py-3.5 text-xs font-medium tabular-nums w-12" style={{ color: "var(--text-muted)" }}>
        {index + 1}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "color-mix(in srgb, var(--accent) 10%, var(--surface))",
              color: "var(--accent-hover)",
            }}
          >
            {student.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {student.name}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-muted)" }}>
        {student.phone ? (
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
            {student.phone}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>--</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-muted)" }}>
        {student.parentPhone ? (
          <span className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
            {student.parentPhone}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)", opacity: 0.4 }}>--</span>
        )}
      </td>
      <td className="px-5 py-3.5 text-sm" style={{ color: "var(--text-muted)" }}>
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
    return <FullPageLoader message="Loading classroom..." />;
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--background)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "color-mix(in srgb, var(--danger) 8%, var(--surface))",
            }}
          >
            <AlertCircle className="w-7 h-7" style={{ color: "var(--danger)" }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="brand-btn-primary mt-4 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const logo = (
    <div className="flex items-center gap-3">
      <button
        id="back-to-dashboard-btn"
        onClick={() => navigate("/dashboard")}
        className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div>
        <h1
          className="text-sm font-semibold tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
        >
          {room.roomName}
        </h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {studentsLoading
            ? "Loading..."
            : `${students.length} student${students.length !== 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );

  const navRight = (
    <div className="flex items-center gap-2">
      <button
        id="toggle-add-student-btn"
        onClick={() => setShowForm(!showForm)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                   transition-all duration-200 cursor-pointer active:scale-[0.98]"
        style={{
          background: showForm ? "var(--surface-2)" : "var(--accent)",
          color: showForm ? "var(--text-primary)" : "#fff",
          border: showForm ? "1px solid var(--border)" : "1px solid color-mix(in srgb, var(--accent) 88%, #000)",
        }}
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

      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "var(--accent)" }}
      >
        <span className="text-sm font-extrabold text-white leading-none">A</span>
      </div>
    </div>
  );

  return (
    <AppShell logo={logo} navRight={navRight}>
      {/* Room Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="brand-card p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--accent) 10%, var(--surface))",
              }}
            >
              <School className="w-6 h-6" style={{ color: "var(--accent-hover)" }} />
            </div>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
              >
                {room.roomName}
              </h2>
              <div
                className="flex items-center gap-1.5 mt-0.5 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
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
          <div
            className="text-center px-5 py-3 rounded-xl border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {students.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {students.length === 1 ? "Student" : "Students"}
            </p>
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
            <div className="brand-card p-6 mt-6">
              <h3
                className="text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <UserPlus className="w-4 h-4" style={{ color: "var(--accent)" }} />
                Add New Student
              </h3>

              <form onSubmit={handleAddStudent} id="add-student-form">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="student-name"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Student Name <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => { setStudentName(e.target.value); setFormError(""); }}
                      placeholder="e.g. Priya Sharma"
                      className="brand-input"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="student-phone"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Phone Number
                    </label>
                    <input
                      id="student-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="brand-input"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="parent-phone"
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Parent Phone Number
                    </label>
                    <input
                      id="parent-phone"
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="e.g. 9123456780"
                      className="brand-input"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mb-4"
                    >
                      <ErrorBanner>
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{formError}</span>
                      </ErrorBanner>
                    </motion.div>
                  )}

                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mb-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm"
                      style={{
                        background: "color-mix(in srgb, var(--success) 6%, var(--surface))",
                        borderColor: "color-mix(in srgb, var(--success) 20%, var(--border))",
                        color: "var(--success)",
                      }}
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
                    className="brand-btn-primary"
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
                    className="brand-btn-secondary"
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
        className="brand-card overflow-hidden mt-6"
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <h3
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Users className="w-4 h-4" style={{ color: "var(--accent)" }} />
            Students
          </h3>
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
            {students.length} total
          </span>
        </div>

        {studentsLoading ? (
          <div className="px-5 py-2">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider w-12" style={{ color: "var(--text-muted)" }}>#</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Student Name</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Parent Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="No students yet"
            description='Click "Add Student" above to enrol your first student.'
            actionLabel={!showForm ? "Add First Student" : undefined}
            onAction={!showForm ? () => setShowForm(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider w-12" style={{ color: "var(--text-muted)" }}>#</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Student Name</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Parent Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Date Added</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <StudentRow key={s.id} student={s} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
