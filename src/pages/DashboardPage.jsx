import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuthState } from "../components/AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

/* ─── Classroom Card with live student count ─── */
function ClassroomCard({ room, onOpen }) {
  const [studentCount, setStudentCount] = useState(null);

  useEffect(() => {
    if (!db || !room.id) return;

    // Realtime listener for student count in this room
    const q = query(
      collection(db, "students"),
      where("roomId", "==", room.id)
    );
    const unsub = onSnapshot(q, (snap) => {
      setStudentCount(snap.size);
    });
    return unsub;
  }, [room.id]);

  // Pick a gradient accent color based on room name hash
  const colors = [
    "from-indigo-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-violet-500 to-fuchsia-600",
  ];
  const colorIdx =
    room.roomName
      ?.split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-surface-100 shadow-sm
                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                    flex flex-col overflow-hidden animate-fade-in group">
      {/* Color accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${colors[colorIdx]}`} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-lg shrink-0
                          group-hover:scale-105 transition-transform duration-200">
              🏫
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-surface-800 truncate leading-tight">
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
        </div>

        {/* Student count badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-100">
            <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span className="text-xs font-semibold text-surface-600">
              {studentCount === null ? "…" : studentCount}
            </span>
            <span className="text-xs text-surface-400">
              {studentCount === 1 ? "student" : "students"}
            </span>
          </div>
        </div>

        {/* Open button */}
        <button
          onClick={() => onOpen(room.id)}
          className="mt-auto w-full py-2.5 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold
                     hover:bg-primary-500 hover:text-white
                     transition-all duration-200 cursor-pointer active:scale-[0.98]
                     flex items-center justify-center gap-1.5"
        >
          Open Classroom
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile } = useAuthState();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  /* ── Classroom state ── */
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

  /* ── Realtime listener for teacher's rooms ── */
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
        // Sort client-side: newest first
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

  /* ── Realtime total student count for this teacher ── */
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

  /* ── Create classroom ── */
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
      {/* ─── Top Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20">
                <span className="text-base font-extrabold text-white leading-none">A</span>
              </div>
              <span className="text-lg font-bold text-surface-800 tracking-tight hidden sm:block">
                AarVedics <span className="text-primary-500">Lite</span>
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                id="notification-btn"
                className="relative w-9 h-9 rounded-xl bg-surface-50 border border-surface-100
                           flex items-center justify-center text-surface-400 hover:text-surface-600
                           hover:bg-surface-100 transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500 ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600
                                flex items-center justify-center text-white text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <button
                  id="sign-out-btn"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             text-sm font-medium text-surface-500 hover:text-danger-500
                             hover:bg-danger-500/5 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Page Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
            {greeting},{" "}
            <span className="text-primary-500">{displayName}</span> 👋
          </h1>
          <p className="mt-1 text-surface-400 text-sm sm:text-base">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Classrooms stat */}
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6 hover:shadow-md
                         transition-all duration-300 hover:-translate-y-0.5 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-xl">🏫</div>
              <div>
                <p className="text-sm text-surface-400 font-medium">Classrooms</p>
                <p className="text-2xl font-bold text-surface-800 tracking-tight">
                  {roomsLoading ? "…" : rooms.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Students stat */}
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6 hover:shadow-md
                         transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
               style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-400/10 flex items-center justify-center text-xl">👨‍🎓</div>
              <div>
                <p className="text-sm text-surface-400 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-surface-800 tracking-tight">
                  {totalStudents === null ? "…" : totalStudents}
                </p>
              </div>
            </div>
          </div>

          {/* Account stat */}
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6 hover:shadow-md
                         transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
               style={{ animationDelay: "160ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning-400/10 flex items-center justify-center text-xl">✅</div>
              <div>
                <p className="text-sm text-surface-400 font-medium">Account Status</p>
                <p className="text-2xl font-bold text-accent-600 tracking-tight">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Classrooms Section ─── */}
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-800 tracking-tight">
              Your Classrooms
            </h2>
            <span className="text-xs text-surface-300 font-medium">
              {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
            </span>
          </div>

          {/* Create Classroom Card */}
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50
                             text-surface-800 text-sm placeholder:text-surface-300
                             focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400
                             transition-all duration-200"
                />
              </div>
              <button
                id="create-room-btn"
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600
                           text-white font-semibold text-sm whitespace-nowrap
                           hover:from-primary-600 hover:to-primary-700
                           focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-200 shadow-md shadow-primary-500/20
                           active:scale-[0.98] cursor-pointer"
              >
                {creating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Classroom
                  </span>
                )}
              </button>
            </form>

            {roomError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-danger-500/5 border border-danger-400/20 px-4 py-2.5 text-sm text-danger-600 animate-fade-in">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{roomError}</span>
              </div>
            )}
          </div>

          {/* Classrooms Grid */}
          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-3 border-primary-200 border-t-primary-500 animate-spin" />
                <p className="text-xs text-surface-400">Loading classrooms…</p>
              </div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-5 text-4xl">
                🏫
              </div>
              <p className="text-base font-semibold text-surface-600">No classrooms yet</p>
              <p className="text-sm text-surface-400 mt-1 max-w-xs mx-auto">
                Create your first classroom above and start adding students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <ClassroomCard key={room.id} room={room} onOpen={handleOpenRoom} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-surface-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-300">
            © {new Date().getFullYear()} AarVedics Lite. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-surface-300 hover:text-surface-500 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-surface-300 hover:text-surface-500 transition-colors">Terms</a>
            <a href="#" className="text-xs text-surface-300 hover:text-surface-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
