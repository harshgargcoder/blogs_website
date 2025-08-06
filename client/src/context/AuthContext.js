import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signOutUser,
  signInWithGoogle,
  auth 
} from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return signUpWithEmail(email, password);
  }

  function login(email, password) {
    return signInWithEmail(email, password);
  }

  function googleLogin() {
    return signInWithGoogle();
  }

  function logout() {
    return signOutUser();
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}