import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const AuthContext = createContext(null);

function formatUser(firebaseUser) {
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    name:
      firebaseUser.displayName ||
      firebaseUser.email?.split("@")[0] ||
      "Student",
    email: firebaseUser.email || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore Firebase login session on refresh
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(formatUser(firebaseUser));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const safeUser = formatUser(credential.user);

    setUser(safeUser);

    return safeUser;
  };

  // Signup
  const signup = async ({ name, email, password }) => {
  const cleanName = name.trim();
  const cleanEmail = email.trim();

  // 1. Create Firebase Auth account
  const credential = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  // 2. Save display name in Firebase Auth
  await updateProfile(credential.user, {
    displayName: cleanName,
  });

  const safeUser = {
    id: credential.user.uid,
    name: cleanName,
    email: credential.user.email || cleanEmail,
  };

  // 3. Let user enter dashboard immediately
  setUser(safeUser);

  // 4. Save profile to Firestore in background
  setDoc(
    doc(db, "users", credential.user.uid),
    {
      name: safeUser.name,
      email: safeUser.email,
      uid: credential.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
    .then(() => {
      console.log("Firestore profile saved ✅");
    })
    .catch((error) => {
      console.error("Firestore profile save error:", error);
    });

  return safeUser;
};
  // Forgot password
  const resetPassword = async (email) => {
    const cleanEmail = email?.trim();

    if (!cleanEmail) {
      const error = new Error("Please enter your email address first.");
      error.code = "auth/missing-email";
      throw error;
    }

    await sendPasswordResetEmail(auth, cleanEmail);

    return true;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Update profile
  const updateUser = async (patch) => {
    if (!auth.currentUser) return;

    if (patch.name?.trim()) {
      await updateProfile(auth.currentUser, {
        displayName: patch.name.trim(),
      });
    }

    try {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          ...patch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Firestore profile update error:", error);
    }

    setUser((current) => {
      if (!current) return current;

      return {
        ...current,
        ...patch,
      };
    });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      signup,
      resetPassword,
      logout,
      updateUser,
      loading,
      isAuthenticated: Boolean(user),
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}