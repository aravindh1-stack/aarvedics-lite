import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuthState } from "../components/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { Bell, LogOut, Plus, ArrowRight, Users, School, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader as Loader2 } from "lucide-react";
import { AppShell, FullPageLoader, EmptyState, ErrorBanner } from "../components/layout";

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      variants={fadeUp}
      className="brand-card p-5 md:p-6 transform transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(15,23,42,0.12)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </motion.div>
  );
}

function ClassroomCard({ room, onOpen }) {
  const [studentCount, setStudentCount] = useState(null);

  useEffect(() => {
    if (!db || !room.id) return;
    const q = query(
      collection(db, "students"),
      where("roomId", "==", room.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      setStudentCount(snap.size);
    });
    return unsub;
  }, [room.id]);

  const colors = [
    "bg-blue-50 text-blue-600",
    "bg-teal-50 text-teal-600",
    "bg-amber-50 text-amber-600",
    "bg-rose-50 text-rose-600",
    "bg-cyan-50 text-cyan-600",
  ];
  const colorIdx =
    room.roomName
      ?.split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length || 0;

  return (
    <motion.div
      variants={fadeUp}
      layout
      className="brand-card flex flex-col overflow-hidden group transform transition-all duration-300
                 hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_rgba(15,23,42,0.14)]
                 ring-1 ring-transparent hover:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
    >
      <div className="p-5 md:p-6 flex flex-col flex-1 gap-5">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${colors[colorIdx]}`}
          >
            <School className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3
              className="text-sm font-semibold truncate leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {room.roomName}
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {room.createdAt?.toDate
                ? room.createdAt.toDate().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Just now"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs"
            style={{
              backgroundColor: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <Users className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
            <span className="font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {studentCount === null ? "…" : studentCount}
            </span>
            <span>{studentCount === 1 ? "student" : "students"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpen(room.id)}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
                     text-white shadow-sm transition-all duration-200 active:scale-[0.98]
                     hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
          style={{
            background: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 96%, #fff) 0%, var(--accent-hover) 100%)",
          }}
        >
          Open classroom
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuthState();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [totalStudents, setTotalStudents] = useState(null);

  const displayName =
    profile?.name || user?.displayName || user?.email?.split("@")[0] || "Teacher";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    if (!user?.uid || !db) {
      setRoomsLoading(false);
      return;
    }

    const q = query(
      collection(db, "rooms"),
      where("teacherId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        roomsList.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });
        setRooms(roomsList);
        setRoomsLoading(false);
      },
      (err) => {
        console.error("Rooms listener error:", err);
        setRoomsLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !db) return;

    const q = query(
      collection(db, "students"),
      where("teacherId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setTotalStudents(snap.size);
    });
    return unsub;
  }, [user?.uid]);

  async function handleCreateRoom(e) {
    e.preventDefault();
    setRoomError("");

    if (!roomName.trim()) {
      setRoomError("Please enter a classroom name.");
      return;
    }
    if (!db) {
      setRoomError("Firestore is not configured.");
      return;
    }

    setCreating(true);
    try {
      await addDoc(collection(db, "rooms"), {
        teacherId: user.uid,
        roomName: roomName.trim(),
        createdAt: serverTimestamp(),
      });
      setRoomName("");
    } catch (err) {
      console.error("Create room error:", err);
      setRoomError("Failed to create classroom. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  function handleOpenRoom(roomId) {
    navigate(`/room/${roomId}`);
  }

  async function handleSignOut() {
    setLoggingOut(true);
    try {
      await signOut(auth);
    } catch {
      setLoggingOut(false);
    }
  }

  const logo = (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
        style={{ backgroundColor: "#0A192F" }}
      >
        <span className="text-sm font-extrabold text-white leading-none">A</span>
      </div>
      <span
        className="text-base font-bold tracking-tight truncate"
        style={{
          fontFamily: '"Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif',
          color: "var(--text-primary)",
        }}
      >
        Aarvedics
      </span>
    </div>
  );

  const navRight = (
    <div className="flex items-center gap-2">
      <button
        id="notification-btn"
        type="button"
        className="relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-[1.02]"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <Bell className="w-4 h-4" style={{ color: "#0A192F" }} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4F9CF9] ring-2 ring-[var(--surface)]" />
      </button>

      <div className="hidden sm:block w-px h-6 mx-0.5" style={{ backgroundColor: "var(--border)" }} />

      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm"
          style={{ backgroundColor: "var(--accent)", color: "#0A192F" }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span
          className="hidden sm:inline max-w-[140px] truncate text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {displayName}
        </span>
        <button
          id="sign-out-btn"
          type="button"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {loggingOut ? "…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <AppShell logo={logo} navRight={navRight}>
      {roomsLoading ? (
        <FullPageLoader message="Loading classrooms..." />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <h1
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{
                fontFamily: '"Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif',
                color: "var(--text-primary)",
              }}
            >
              {greeting},{" "}
              <span style={{ color: "var(--accent)" }}>{displayName}</span>
            </h1>
            <p className="text-sm md:text-base max-w-xl" style={{ color: "var(--text-muted)" }}>
              Here&apos;s what&apos;s happening with your classrooms today.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mt-8 md:mt-10"
          >
            <StatCard
              icon={School}
              label="Classrooms"
              value={rooms.length}
              color="bg-[#f7f6ef] text-[#0A192F]"
            />
            <StatCard
              icon={Users}
              label="Total Students"
              value={totalStudents === null ? "…" : totalStudents}
              color="bg-[#eef6fb] text-[#4F9CF9]"
            />
            <StatCard
              icon={CheckCircle2}
              label="Account Status"
              value="Active"
              color="bg-[#eef9f1] text-emerald-600"
            />
          </motion.div>

          <div className="mt-10 md:mt-14 space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h2
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                  style={{
                    fontFamily: '"Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif',
                    color: "var(--text-primary)",
                  }}
                >
                  Your Classrooms
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Create a room, then open it to add students.
                </p>
              </div>
              <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: "var(--text-muted)" }}>
                {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="brand-card p-6 md:p-8"
            >
              <form onSubmit={handleCreateRoom} className="flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-6">
                <div className="flex-1 min-w-0 space-y-2">
                  <label htmlFor="room-name" className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    New classroom
                  </label>
                  <input
                    id="room-name"
                    type="text"
                    value={roomName}
                    onChange={(e) => {
                      setRoomName(e.target.value);
                      setRoomError("");
                    }}
                    placeholder="e.g. Class 10-A Physics"
                    className="brand-input rounded-xl py-3"
                  />
                </div>
                <button
                  id="create-room-btn"
                  type="submit"
                  disabled={creating}
                  className="brand-btn-primary lg:self-end whitespace-nowrap px-6 py-3 rounded-xl shrink-0"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Classroom
                    </>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {roomError ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-5 flex items-start gap-2"
                  >
                    <ErrorBanner className="w-full">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{roomError}</span>
                    </ErrorBanner>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            {rooms.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState
                  title="No classrooms yet"
                  description="Create your first classroom to start managing students."
                  actionLabel="Create classroom"
                  icon={<School className="w-7 h-7" />}
                  onAction={() => handleCreateRoom({ preventDefault() {}, stopPropagation() {} })}
                />
              </motion.div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
              >
                {rooms.map((room) => (
                  <ClassroomCard key={room.id} room={room} onOpen={handleOpenRoom} />
                ))}
              </motion.div>
            )}
          </div>

          <footer
            className="mt-14 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              &copy; {new Date().getFullYear()} AarVedics Lite
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-xs transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                Privacy
              </a>
              <a href="#" className="text-xs transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                Terms
              </a>
              <a href="#" className="text-xs transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                Support
              </a>
            </div>
          </footer>
        </>
      )}
    </AppShell>
  );
}
