import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { Plus, Ticket, Trophy, Trash2, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { raffles, deleteRaffle } = useRaffle();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleDelete = (e, id) => {
        e.preventDefault(); // Prevent navigation to details
        if (window.confirm('¿Estás seguro de que quieres eliminar esta rifa? Esta acción no se puede deshacer.')) {
            deleteRaffle(id);
        }
    };

    const handleEdit = (e, id) => {
        e.preventDefault();
        navigate(`/edit/${id}`);
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Hola, {user?.name}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Gestiona tus sorteos</p>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <LogOut size={24} />
                </button>
            </header>

            <div style={{ display: 'grid', gap: '20px' }}>
                {raffles.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Ticket size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <h3>No tienes rifas activas</h3>
                        <p>Crea tu primera rifa para empezar</p>
                    </div>
                ) : (
                    raffles.map((raffle) => (
                        <Link to={`/raffle/${raffle.id}`} key={raffle.id} style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'block' }}>
                            <div className="glass-panel" style={{ padding: '20px', transition: 'transform 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', paddingRight: '80px' }}>{raffle.title}</h3>

                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        display: 'flex',
                                        gap: '8px',
                                        zIndex: 10
                                    }}>
                                        <button
                                            onClick={(e) => handleEdit(e, raffle.id)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: 'none',
                                                color: 'white',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, raffle.id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: 'none',
                                                color: 'var(--danger)',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <span style={{
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        color: '#4ade80',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        position: 'absolute', /* Positioning tweaked */
                                        bottom: '20px',
                                        right: '20px'
                                    }}>
                                        {raffle.tickets.filter(t => t.status === 'sold').length} / {raffle.ticketCount} Vendidos
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Ticket size={16} />
                                        <span>{raffle.ticketCount} Números</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Trophy size={16} />
                                        <span>{raffle.prizes.length} Premios</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <Link to="/create" className="btn-primary" style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                padding: 0,
                boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)'
            }}>
                <Plus size={24} />
            </Link>
        </div>
    );
};

export default Home;
