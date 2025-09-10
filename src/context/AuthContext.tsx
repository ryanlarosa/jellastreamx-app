import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const CREDENTIALS_KEY = "userCredentials";

interface AuthContextType {
  user: User | "guest" | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  loginAsGuest: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | "guest" | null>(null);
  const [loading, setLoading] = useState(true);

  // --- START OF DEFINITIVE FIX ---
  // This single, robust useEffect handles the entire initial auth flow.
  useEffect(() => {
    // onAuthStateChanged is the single source of truth.
    // Its first callback tells us the initial, definitive user state.
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Firebase found an active session, we are done loading.
        setUser(currentUser);
        setLoading(false);
      } else {
        // If Firebase finds no user, we try our manual sign-in just in case.
        try {
          const credentialsString = await SecureStore.getItemAsync(
            CREDENTIALS_KEY
          );
          if (credentialsString) {
            const { email, password } = JSON.parse(credentialsString);
            // Try to sign in. The onAuthStateChanged listener will fire again if successful.
            // If it fails, that's okay, the user is still logged out.
            await signInWithEmailAndPassword(auth, email, password);
            // We DON'T stop loading here; we wait for the listener to confirm.
          } else {
            // No saved credentials, so we are definitely logged out. Stop loading.
            setLoading(false);
          }
        } catch (error) {
          // An error occurred checking storage. We are logged out. Stop loading.
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []); // The empty array [] ensures this runs only once on app startup.
  // --- END OF DEFINITIVE FIX ---

  const signInWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    await SecureStore.setItemAsync(
      CREDENTIALS_KEY,
      JSON.stringify({ email, password: pass })
    );
    return userCredential;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    await SecureStore.setItemAsync(
      CREDENTIALS_KEY,
      JSON.stringify({ email, password: pass })
    );
    return userCredential;
  };

  const loginAsGuest = () => {
    setLoading(false);
    setUser("guest");
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    if (user !== "guest" && user) {
      await signOut(auth);
    }
    // The onAuthStateChanged listener will automatically set the user to null.
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmail,
        signUpWithEmail,
        logout,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
