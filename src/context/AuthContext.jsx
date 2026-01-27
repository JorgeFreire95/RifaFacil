import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load session on startup
    useEffect(() => {
        const session = sessionStorage.getItem('active_session');
        if (session) {
            setUser(JSON.parse(session));
        }
        setLoading(false);
    }, []);

    // "Database" simulation using LocalStorage
    const getUsers = () => {
        const users = localStorage.getItem('users_db');
        return users ? JSON.parse(users) : [];
    };

    const login = (email, password) => {
        const users = getUsers();
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const { password, ...userWithoutPass } = foundUser; // Exclude password from session
            setUser(userWithoutPass);
            sessionStorage.setItem('active_session', JSON.stringify(userWithoutPass));
            return { success: true };
        }
        return { success: false, message: 'Credenciales inválidas' };
    };

    const register = (name, email, password) => {
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'El usuario ya existe' };
        }

        const newUser = { id: `local_${Date.now()}`, name, email, password, provider: 'local' };
        const updatedUsers = [...users, newUser];
        localStorage.setItem('users_db', JSON.stringify(updatedUsers));

        // Auto login after register
        const { password: _, ...userWithoutPass } = newUser;
        setUser(userWithoutPass);
        sessionStorage.setItem('active_session', JSON.stringify(userWithoutPass));
        return { success: true };
    };

    const logout = async () => {
        setUser(null);
        sessionStorage.removeItem('active_session');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
