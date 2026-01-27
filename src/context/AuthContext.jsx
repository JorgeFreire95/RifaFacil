import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to Firebase Auth state
    // Listen to Firebase Auth state
    useEffect(() => {
        setPersistence(auth, browserSessionPersistence)
            .then(() => {
                const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                    if (currentUser) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                            if (userDoc.exists()) {
                                setUser({ uid: currentUser.uid, email: currentUser.email, ...userDoc.data() });
                            } else {
                                setUser({ uid: currentUser.uid, email: currentUser.email });
                            }
                        } catch (e) {
                            console.error("Firestore error in auth listener:", e);
                            setUser({ uid: currentUser.uid, email: currentUser.email });
                        }
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                });
                return () => unsubscribe();
            });
    }, []);

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            // Explicitly set user to avoid race condition with PrivateRoute
            setUser({ uid: result.user.uid, email: result.user.email });
            return { success: true };
        } catch (error) {
            console.error(error);
            let msg = 'Error al iniciar sesión';
            if (error.code === 'auth/invalid-credential') msg = 'Credenciales incorrectas';
            if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
            if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
            return { success: false, message: msg };
        }
    };

    const register = async (name, email, password) => {
        try {
            // 1. Create User in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // EXPLICITLY SET USER STATE TO AVOID RACE CONDITION
            setUser({ uid: user.uid, email: user.email, name: name });

            // 2. Save User Data in Firestore (Best effort)
            try {
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: email,
                    createdAt: new Date().toISOString(),
                    role: 'user'
                });
            } catch (fsError) {
                console.error("Error creating Firestore profile:", fsError);
                // Continue even if Firestore fails - the user account IS created.
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            let msg = 'Error al registrarse';
            if (error.code === 'auth/email-already-in-use') msg = 'El correo ya está registrado';
            else if (error.code === 'auth/weak-password') msg = 'La contraseña es muy débil';
            else if (error.code === 'auth/operation-not-allowed') msg = 'El registro por correo no está habilitado en Firebase';
            else msg = `Error: ${error.message} (${error.code})`;
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const checkEmailAvailable = async (email) => {
        // Firebase handles this on register throws error 'auth/email-already-in-use'
        // Simulating true for the pre-check flow or could rely on error handling
        return true;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkEmailAvailable }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
