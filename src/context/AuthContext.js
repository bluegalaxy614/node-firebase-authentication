// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../firebase-config"; // Import your Firebase app initialization

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);

    // Sign up function
    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Log in function
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Log out function
    const logout = () => {
        return signOut(auth);
    };

    // Automatically set user on session persistence
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [auth]);

    const value = {
        currentUser,
        signup,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
