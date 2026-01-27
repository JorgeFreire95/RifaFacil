import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Verification State
    const [verificationStep, setVerificationStep] = useState(false);
    const [serverOtp, setServerOtp] = useState(null);
    const [userOtp, setUserOtp] = useState('');

    const { login, register, checkEmailAvailable } = useAuth();
    const navigate = useNavigate();

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
            if (verificationStep) {
                // Step 2: Verify OTP
                if (userOtp !== serverOtp) {
                    setError('Código de verificación incorrecto');
                    return;
                }

                // Complete Registration
                const res = await register(formData.name, formData.email, formData.password);
                if (res.success) {
                    setSuccess('¡Usuario creado con éxito! Redirigiendo...');
                    setTimeout(() => navigate('/'), 1500);
                }
                else setError(res.message);

            } else {
                // Step 1: Initiate & Verify Availability
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

                // Generate OTP (4 digits)
                const code = Math.floor(1000 + Math.random() * 9000).toString();
                setServerOtp(code);
                setVerificationStep(true);

                // Simulate Email Sending
                // In a real app, this would call an API
                setTimeout(() => {
                    alert(`[SIMULACIÓN DE CORREO]\n\nTu código de verificación es: ${code}\n\nIngrésalo para validar tu cuenta.`);
                }, 500);
            }
        }
    };

    const resetForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setVerificationStep(false);
        setFormData({ name: '', email: '', password: '' });
        setUserOtp('');
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-card">
                <div className="auth-header">
                    <h1 className="home-greeting">Rifas App</h1>
                    <p className="home-subtitle">
                        {isLogin
                            ? 'Inicia sesión para continuar'
                            : (verificationStep ? 'Verifica tu correo' : 'Crea tu cuenta gratis')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">

                    {verificationStep ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '16px', color: '#4ade80' }}>
                                <Smartphone size={48} style={{ opacity: 0.8 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                                    Hemos enviado un código a <strong>{formData.email}</strong>
                                </p>
                            </div>

                            <div className="input-wrapper">
                                <CheckCircle size={20} className="input-icon" />
                                <input
                                    className="input-field input-with-icon"
                                    placeholder="Código de 4 dígitos"
                                    value={userOtp}
                                    onChange={e => setUserOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}

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
                        {verificationStep ? 'Validar Código' : (isLogin ? 'Ingresar' : 'Continuar')} <ArrowRight size={20} />
                    </button>

                    {verificationStep && (
                        <button
                            type="button"
                            onClick={() => setVerificationStep(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', marginTop: '-8px' }}
                        >
                            ¿Email incorrecto? Volver
                        </button>
                    )}
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
        </div>
    );
};

export default Login;
