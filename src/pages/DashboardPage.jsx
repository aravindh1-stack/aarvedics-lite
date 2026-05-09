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
  CheckCircle2,
  AlertCircle,
  Search,
  LayoutGrid,
  Loader2,
} from "lucide-react";

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

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl border border-surface-200/60 p-5
                 hover:border-surface-300 hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-surface-900 tracking-tight">{value}</p>
      <p className="text-sm text-surface-400 mt-0.5">{label}</p>
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
      className="bg-white rounded-2xl border border-surface-200/60
                  hover:border-surface-300 hover:shadow-md
                  transition-all duration-200
                  flex flex-col overflow-hidden group"
    >
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[colorIdx]}`}>
            <School className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-surface-800 truncate leading-tight">
              {room.roomName}
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-100">
            <Users className="w-3.5 h-3.5 text-surface-400" />
            <span className="text-xs font-semibold text-surface-600">
              {studentCount === null ? "..." : studentCount}
            </span>
            <span className="text-xs text-surface-400">
              {studentCount === 1 ? "student" : "students"}
            </span>
          </div>
        </div>

        <button
          onClick={() => onOpen(room.id)}
          className="mt-auto w-full py-2.5 rounded-xl bg-surface-50 border border-surface-200
                     text-surface-700 text-sm font-medium
                     hover:bg-primary-600 hover:text-white hover:border-primary-600
                     transition-all duration-200 cursor-pointer active:scale-[0.98]
                     flex items-center justify-center gap-1.5 group-hover:border-primary-200"
        >
          Open Classroom
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200/60 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton" />
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

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-extrabold text-white leading-none">A</span>
              </div>
              <span className="text-base font-bold text-surface-900 tracking-tight hidden sm:block">
                AarVedics
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="notification-btn"
                className="relative w-8 h-8 rounded-lg bg-surface-50 border border-surface-200/60
                           flex items-center justify-center text-surface-400 hover:text-surface-600
                           hover:bg-surface-100 transition-all duration-200 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-500 ring-2 ring-white" />
              </button>

              <div className="w-px h-5 bg-surface-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100
                                flex items-center justify-center text-primary-700 text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-surface-700 hidden sm:block max-w-[120px] truncate">
                  {displayName}
                </span>
                <button
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                             text-xs font-medium text-surface-400 hover:text-danger-500
                             hover:bg-danger-50 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {loggingOut ? "..." : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
            {greeting}, <span className="text-primary-600">{displayName}</span>
          </h1>
          <p className="mt-1 text-surface-400 text-sm">
            Here's what's happening with your classrooms today.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <StatCard
            icon={School}
            label="Classrooms"
            value={roomsLoading ? "..." : rooms.length}
            color="bg-primary-50 text-primary-600"
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
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900 tracking-tight">
              Your Classrooms
            </h2>
            <span className="text-xs text-surface-400 font-medium tabular-nums">
              {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </span>
          </div>

          {/* Create Classroom */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl border border-surface-200/60 p-5"
          >
            <form onSubmit={handleCreateRoom} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label htmlFor="room-name" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Create a new classroom
                </label>
                <input
                  id="room-name"
                  type="text"
                  value={roomName}
                  onChange={(e) => { setRoomName(e.target.value); setRoomError(""); }}
                  placeholder="e.g. Class 10-A Physics"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white
                             text-surface-800 text-sm placeholder:text-surface-300
                             focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400
                             transition-all duration-200"
                />
              </div>
              <button
                id="create-room-btn"
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl bg-primary-600
                           text-white font-semibold text-sm whitespace-nowrap
                           hover:bg-primary-700
                           focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200
                           active:scale-[0.98] cursor-pointer
                           flex items-center gap-1.5"
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
                  className="mt-3 flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-400/15 px-4 py-2.5 text-sm text-danger-600"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{roomError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Classrooms Grid */}
          {roomsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                <School className="w-8 h-8 text-surface-300" />
              </div>
              <p className="text-sm font-semibold text-surface-600">No classrooms yet</p>
              <p className="text-sm text-surface-400 mt-1 max-w-xs mx-auto">
                Create your first classroom above and start adding students.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {rooms.map((room) => (
                <ClassroomCard key={room.id} room={room} onOpen={handleOpenRoom} />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200/60 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} AarVedics Lite
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">Terms</a>
            <a href="#" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
