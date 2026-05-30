import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRecoverModal, setShowRecoverModal] = useState(false);
    const [recoverEmail, setRecoverEmail] = useState('');

    const { user, login, register, checkEmailAvailable, recoverPassword } = useAuth();
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

    // Recover Password Function
    const handleRecoverPassword = async (e) => {
        e.preventDefault();
        if (!validateEmail(recoverEmail)) {
            setError('Ingresa un correo válido para recuperar');
            return;
        }

        const res = await recoverPassword(recoverEmail);
        if (res.success) {
            setSuccess('Se ha enviado un correo de recuperación. Revisa tu bandeja de entrada.');
            setShowRecoverModal(false);
            setRecoverEmail('');
        } else {
            // Show error in the main form or a specific error state for the modal?
            // For simplicity, let's use the main error state or an alert
            setError(res.message);
            // If we want the error to persist in the modal, we need a separate error state for it.
            // Let's just close and show the error on the main screen for now, or better:
            // kept the modal open and show error there. But I need a local error state for the modal.
        }
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

                    {/* Forgot Password Link */}
                    {isLogin && (
                        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setRecoverEmail(formData.email || ''); // Pre-fill if they typed it
                                    setShowRecoverModal(true);
                                    setError('');
                                    setSuccess('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-banner">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="error-banner" style={{ background: 'var(--success-light)', color: 'var(--success)', borderColor: 'var(--success)' }}>
                            {success}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
                        {isLogin ? 'Ingresar' : 'Registrarse'} <ArrowRight size={20} />
                    </button>


                </form>

                <div className="auth-footer">
                    <button
                        onClick={resetForm}
                        className="auth-switch-btn"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'underline' }}>
                            Aviso de privacidad
                        </Link>
                    </div>
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
                            background: 'var(--success-light)',
                            color: 'var(--success)',
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

            {/* Custom Recover Password Modal */}
            {showRecoverModal && (
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
                        width: '350px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Recuperar Contraseña</h2>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        <div className="input-wrapper" style={{ marginBottom: '1rem' }}>
                            <Mail size={20} className="input-icon" />
                            <input
                                className="input-field input-with-icon"
                                type="email"
                                placeholder="Correo electrónico"
                                value={recoverEmail}
                                onChange={e => setRecoverEmail(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowRecoverModal(false)}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleRecoverPassword}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
