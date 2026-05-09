import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isConfigured } from "../firebase";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  configured: true,
});

export function useAuthState() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          setUser(firebaseUser);

          if (firebaseUser && db) {
            try {
              const snap = await getDoc(doc(db, "users", firebaseUser.uid));
              if (snap.exists()) {
                setProfile(snap.data());
              } else {
                setProfile({
                  uid: firebaseUser.uid,
                  name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                  email: firebaseUser.email,
                });
              }
            } catch (err) {
              console.error("Failed to fetch user profile:", err);
              setProfile({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                email: firebaseUser.email,
              });
            }
          } else {
            setProfile(null);
          }

          setLoading(false);
        },
        (error) => {
          console.error("Auth state listener error:", error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Firebase auth initialization error:", err);
      setLoading(false);
    }

    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) console.warn("Auth state listener timed out.");
        return false;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, configured: isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}
