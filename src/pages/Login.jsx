import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const res = login(formData.email, formData.password);
            if (res.success) navigate('/');
            else setError(res.message);
        } else {
            if (!formData.name || !formData.email || !formData.password) {
                setError('Todos los campos son obligatorios');
                return;
            }
            const res = register(formData.name, formData.email, formData.password);
            if (res.success) navigate('/');
            else setError(res.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'var(--bg-gradient)'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Rifas App</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                    {!isLogin && (
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            type="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '40px' }}
                            type="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
                        {isLogin ? 'Ingresar' : 'Registrarse'} <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
