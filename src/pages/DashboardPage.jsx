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
import {
  Bell,
  LogOut,
  Plus,
  ArrowRight,
  Users,
  School,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  Loader as Loader2,
} from "lucide-react";
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
              {studentCount === null ? "..." : studentCount}
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

function SkeletonCard() {
  return (
    <div className="brand-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl skeleton" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 w-3/4 rounded skeleton" />
          <div className="h-3 w-1/2 rounded skeleton" />
        </div>
      </div>
      <div className="h-7 w-24 rounded-lg skeleton" />
      <div className="h-10 w-full rounded-xl skeleton" />
    </div>
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
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "var(--accent)" }}
      >
        <span className="text-sm font-extrabold text-white leading-none">A</span>
      </div>
      <span
        className="text-base font-bold tracking-tight hidden sm:block"
        style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
      >
        AarVedics
      </span>
    </div>
  );

  const navRight = (
    <div className="flex items-center gap-2">
      <button
        id="notification-btn"
        className="relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <Bell className="w-4 h-4" />
        <span
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full ring-2"
          style={{ background: "var(--accent)", ringColor: "var(--surface)" }}
        />
      </button>

      <div className="w-px h-5 mx-1 hidden sm:block" style={{ background: "var(--border)" }} />

      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{
            background: "color-mix(in srgb, var(--accent) 12%, var(--surface))",
            color: "var(--accent-hover)",
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span
          className="text-sm font-medium hidden sm:block max-w-[120px] truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {displayName}
        </span>
        <button
          id="sign-out-btn"
          onClick={handleSignOut}
          disabled={loggingOut}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                     text-xs font-medium transition-all duration-200 cursor-pointer"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger)";
            e.currentTarget.style.background = "color-mix(in srgb, var(--danger) 6%, var(--surface))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          {loggingOut ? "..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <AppShell logo={logo} navRight={navRight}>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
        >
          {greeting}, <span style={{ color: "var(--accent)" }}>{displayName}</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Here's what's happening with your classrooms today.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8"
      >
        <StatCard
          icon={School}
          label="Classrooms"
          value={roomsLoading ? "..." : rooms.length}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents === null ? "..." : totalStudents}
          color="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Account Status"
          value="Active"
          color="bg-emerald-50 text-emerald-600"
        />
      </motion.div>

      {/* Classrooms Section */}
      <div className="space-y-6 mt-10">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--aarga-primary-navy)" }}
          >
            Your Classrooms
          </h2>
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
            {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
          </span>
        </div>

        {/* Create Classroom */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="brand-card p-6"
        >
          <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label
                htmlFor="room-name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Create a new classroom
              </label>
              <input
                id="room-name"
                type="text"
                value={roomName}
                onChange={(e) => { setRoomName(e.target.value); setRoomError(""); }}
                placeholder="e.g. Class 10-A Physics"
                className="brand-input"
              />
            </div>
            <button
              id="create-room-btn"
              type="submit"
              disabled={creating}
              className="brand-btn-primary whitespace-nowrap"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
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
            {roomError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3"
              >
                <ErrorBanner>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{roomError}</span>
                </ErrorBanner>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Classrooms Grid */}
        {roomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={<School className="w-7 h-7" />}
            title="No classrooms yet"
            description="Create your first classroom above and start adding students."
          />
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {rooms.map((room) => (
              <ClassroomCard key={room.id} room={room} onOpen={handleOpenRoom} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="border-t mt-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} AarVedics Lite
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
            >
              Terms
            </a>
            <a
              href="#"
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </AppShell>
  );
}
