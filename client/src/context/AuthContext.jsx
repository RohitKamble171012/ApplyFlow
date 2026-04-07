import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await api.post('/api/auth/firebase-login', { idToken: token });
          setDbUser(res.data.user);
        } catch (err) {
          console.error('DB login error:', err);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    // Handle token expiry
    const onExpired = () => signOut(auth);
    window.addEventListener('auth:expired', onExpired);

    return () => {
      unsub();
      window.removeEventListener('auth:expired', onExpired);
    };
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
  };

  const refreshDbUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setDbUser(res.data);
    } catch (err) {
      console.error('refreshDbUser error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signInWithGoogle, logout, refreshDbUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
