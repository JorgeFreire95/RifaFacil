import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { Plus, Ticket, Trophy, Trash2, LogOut, Edit, Loader, Cloud, CloudOff, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { raffles, deleteRaffle, loading, error, isSynced } = useRaffle();
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
            <header className="home-header">
                <div>
                    <h1 className="home-greeting">Hola, {user?.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p className="home-subtitle">Gestiona tus sorteos</p>
                        {isSynced ? (
                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }} title="Tus datos están seguros en la base de datos">
                                <Cloud size={14} style={{ marginRight: '4px' }} /> Datos en la nube
                            </span>
                        ) : (
                            <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }} title="Los datos aún no han llegado al servidor. Verifica tu conexión.">
                                <CloudOff size={14} style={{ marginRight: '4px' }} /> ⚠ Pendiente de subir (No desinstalar)
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={24} />
                </button>
            </header>



            <div className="raffles-container">
                {loading ? (
                    <div className="glass-panel empty-state">
                        <Loader size={48} style={{ opacity: 0.5, marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : error ? (
                    <div className="glass-panel empty-state" style={{ borderColor: 'var(--danger)' }}>
                        <h3 style={{ color: 'var(--danger)' }}>Error de conexión</h3>
                        <p>{error}</p>
                    </div>
                ) : raffles.length === 0 ? (
                    <div className="glass-panel empty-state">
                        <Ticket size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <h3>No tienes rifas activas</h3>
                        <p>Crea tu primera rifa para empezar</p>
                    </div>
                ) : (
                    raffles.map((raffle) => (
                        <Link to={`/raffle/${raffle.id}`} key={raffle.id} style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'block' }}>
                            <div className="glass-panel raffle-card">
                                <div className="raffle-card-header">
                                    <h3 className="raffle-title">{raffle.title}</h3>

                                    <div className="raffle-actions">
                                        <button
                                            onClick={(e) => handleEdit(e, raffle.id)}
                                            className="btn-icon btn-edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, raffle.id)}
                                            className="btn-icon btn-delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="raffle-info">
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div className="info-item">
                                            <Ticket size={16} />
                                            <span>{raffle.ticketCount} Números</span>
                                        </div>
                                        <div className="info-item">
                                            <Trophy size={16} />
                                            <span>{raffle.prizes.length} Premios</span>
                                        </div>
                                        {raffle.drawDate && (
                                            <div className="info-item" style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                <Calendar size={16} />
                                                <span>{new Date(raffle.drawDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="status-badge">
                                        {raffle.tickets.filter(t => t.status === 'sold').length} / {raffle.ticketCount} Vendidos
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <Link to="/create" className="btn-primary fab-add">
                <Plus size={24} />
            </Link>
        </div>
    );
};

export default Home;
