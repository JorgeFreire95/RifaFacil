import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    browserSessionPersistence,
    sendPasswordResetEmail // Import this
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure Persistence to SESSION (clears on app close)
    useEffect(() => {
        const configurePersistence = async () => {
            try {
                await setPersistence(auth, browserSessionPersistence);
            } catch (err) {
                console.error("Error setting persistence:", err);
            }
        };
        configurePersistence();
    }, []);

    // Listen to Firebase Auth state
    useEffect(() => {
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

            const newUserProfile = {
                uid: user.uid,
                name: name,
                email: email,
                role: 'user',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                provider: 'password',
                photoURL: user.photoURL || '',
                phoneNumber: user.phoneNumber || ''
            };

            // 2. EXPLICITLY SET USER STATE IMMEDIATELY (Optimistic Update)
            // This ensures the UI unblocks even if Firestore is slow/offline
            setUser(newUserProfile);

            // 3. Save User Data in Firestore (Background / Non-blocking)
            setDoc(doc(db, "users", user.uid), newUserProfile)
                .catch(fsError => {
                    console.error("Error saving Firestore profile (will sync later):", fsError);
                });

            return { success: true };
        } catch (error) {
            console.error(error);
            let msg = 'Error al registrarse';
            if (error.code === 'auth/email-already-in-use') msg = 'El correo ya está registrado';
            else if (error.code === 'auth/weak-password') msg = 'La contraseña es muy débil';
            else if (error.code === 'auth/operation-not-allowed') msg = 'El registro por correo no está habilitado en Firebase';
            else msg = error.message;
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

    const loginWithGoogle = async () => {
        try {
            let user;

            if (Capacitor.isNativePlatform()) {
                // Native Login (Android/iOS)
                const result = await FirebaseAuthentication.signInWithGoogle();
                const credential = GoogleAuthProvider.credential(result.credential.idToken);
                const authResult = await signInWithCredential(auth, credential);
                user = authResult.user;
            } else {
                // Web Login
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                user = result.user;
            }

            // Check if user exists in Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                const newUser = {
                    uid: user.uid,
                    name: user.displayName || 'Usuario de Google',
                    email: user.email,
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    provider: 'google',
                    photoURL: user.photoURL || '',
                    phoneNumber: user.phoneNumber || ''
                };

                // Create user doc if first time login
                await setDoc(userRef, newUser);

                // Explicitly set user to avoid race condition
                setUser(newUser);
            } else {
                // Explicitly set user to avoid race condition
                setUser({ uid: user.uid, email: user.email, ...userDoc.data() });
            }

            return { success: true };
        } catch (error) {
            console.error("Google login error", error);
            return { success: false, message: error.message };
        }
    };

    const recoverPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error("Error sending password reset email", error);
            let msg = 'Error al enviar el correo de recuperación';
            if (error.code === 'auth/user-not-found') msg = 'No existe una cuenta con este correo';
            if (error.code === 'auth/invalid-email') msg = 'El correo electrónico no es válido';
            return { success: false, message: msg };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkEmailAvailable, loginWithGoogle, recoverPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
