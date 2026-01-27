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
            <header className="home-header">
                <div>
                    <h1 className="home-greeting">Hola, {user?.name}</h1>
                    <p className="home-subtitle">Gestiona tus sorteos</p>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={24} />
                </button>
            </header>

            <div className="raffles-container">
                {raffles.length === 0 ? (
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

                                    <span className="status-badge">
                                        {raffle.tickets.filter(t => t.status === 'sold').length} / {raffle.ticketCount} Vendidos
                                    </span>
                                </div>

                                <div className="raffle-info">
                                    <div className="info-item">
                                        <Ticket size={16} />
                                        <span>{raffle.ticketCount} Números</span>
                                    </div>
                                    <div className="info-item">
                                        <Trophy size={16} />
                                        <span>{raffle.prizes.length} Premios</span>
                                    </div>
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
