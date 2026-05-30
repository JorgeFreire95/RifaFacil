import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseConfig';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then((response) => {
            const session = response?.data?.session;
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        }).catch(err => {
            console.error("Session fetch error:", err);
            setUser(null);
            setLoading(false);
        });

        // Listen for auth changes
        let subscription;
        try {
            const res = supabase.auth.onAuthStateChange(async (_event, session) => {
                if (session?.user) {
                    await fetchUserProfile(session.user);
                } else {
                    setUser(null);
                    setLoading(false);
                }
            });
            subscription = res?.data?.subscription;
        } catch (e) {
            console.error("Auth listener error:", e);
            setLoading(false);
        }

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (authUser) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching user profile:", error);
            }
            
            if (data) {
                setUser({ uid: authUser.id, email: authUser.email, ...data });
            } else {
                setUser({ uid: authUser.id, email: authUser.email });
            }
        } catch (e) {
            console.error("Exception fetching profile:", e);
            setUser({ uid: authUser.id, email: authUser.email });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(error);
            let msg = 'Error al iniciar sesión';
            if (error.message.includes('Invalid login credentials')) msg = 'Credenciales incorrectas';
            return { success: false, message: msg };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });
            if (error) throw error;

            if (data.user) {
                const newUserProfile = {
                    id: data.user.id,
                    name: name,
                    email: email,
                    role: 'user',
                    provider: 'password'
                };
                
                // Set optimistic state
                setUser({ uid: data.user.id, ...newUserProfile });
                
                // Save to users table
                await supabase.from('users').upsert(newUserProfile);
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            let msg = 'Error al registrarse';
            if (error.message.includes('already registered')) msg = 'El correo ya está registrado';
            else if (error.message.includes('weak')) msg = 'La contraseña es muy débil';
            else msg = error.message;
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const checkEmailAvailable = async (email) => {
        return true;
    };


    const recoverPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Error sending password reset email", error);
            return { success: false, message: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkEmailAvailable, recoverPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
