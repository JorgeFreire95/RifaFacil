import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { user, login, register, checkEmailAvailable, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Redirect logic removed to handle it explicitly in submit handlers for better UX control

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (isLogin) {
            const res = await login(formData.email, formData.password);
            if (res.success) navigate('/');
            else setError(res.message);
        } else {
            // REGISTER FLOW
            if (!formData.name || !formData.email || !formData.password) {
                setError('Todos los campos son obligatorios');
                return;
            }

            if (!validateEmail(formData.email)) {
                setError('Ingresa un correo electrónico válido');
                return;
            }

            const isAvailable = await checkEmailAvailable(formData.email);
            if (!isAvailable) {
                setError('El correo ya está registrado');
                return;
            }

            // Direct Registration
            const res = await register(formData.name, formData.email, formData.password);
            if (res.success) {
                // Show custom modal
                setShowSuccessModal(true);
            }
            else setError(res.message || 'Error en el registro');
        }
    };

    const resetForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card">
                <div className="auth-header">
                    <h1 className="home-greeting">Rifas App</h1>
                    <p className="home-subtitle">
                        {isLogin
                            ? 'Inicia sesión para continuar'
                            : 'Crea tu cuenta gratis'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">

                    {!isLogin && (
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                className="input-field input-with-icon"
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="input-wrapper">
                        <Mail size={20} className="input-icon" />
                        <input
                            className="input-field input-with-icon"
                            type="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="input-wrapper">
                        <Lock size={20} className="input-icon" />
                        <input
                            className="input-field input-with-icon"
                            type="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="error-banner" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderColor: '#4ade80' }}>
                            {success}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
                        {isLogin ? 'Ingresar' : 'Registrarse'} <ArrowRight size={20} />
                    </button>

                    <div className="auth-divider" style={{ margin: '20px 0', textAlign: 'center', position: 'relative' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0 10px', color: '#ccc', fontSize: '0.9rem' }}>O continúa con</span>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            const res = await loginWithGoogle();
                            if (res.success) {
                                navigate('/');
                            } else {
                                setError(res.message);
                            }
                        }}
                        className="btn-secondary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'white',
                            color: '#333',
                            border: 'none',
                            fontWeight: '500'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>


                </form>

                <div className="auth-footer">
                    <button
                        onClick={resetForm}
                        className="auth-switch-btn"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>

            {/* Custom Success Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="glass-panel" style={{
                        padding: '2rem',
                        textAlign: 'center',
                        maxWidth: '90%',
                        width: '320px',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        boxShadow: '0 8px 32px rgba(74, 222, 128, 0.1)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(74, 222, 128, 0.2)',
                            color: '#4ade80',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>¡Éxito!</h2>
                        <p style={{ marginBottom: '1.5rem', color: '#e0e0e0' }}>Usuario registrado exitosamente</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/')}
                            style={{ justifyContent: 'center', width: '100%' }}
                        >
                            Ingresar a la App
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
