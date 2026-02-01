import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { Plus, Ticket, Trophy, Trash2, LogOut, Edit, Loader, Cloud, CloudOff } from 'lucide-react';
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
                            <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }} title="Tus datos están seguros en la base de datos">
                                <Cloud size={14} style={{ marginRight: '4px' }} /> Datos en la nube
                            </span>
                        ) : (
                            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }} title="Los datos aún no han llegado al servidor. Verifica tu conexión.">
                                <CloudOff size={14} style={{ marginRight: '4px' }} /> ⚠ Pendiente de subir (No desinstalar)
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={24} />
                </button>
            </header>

            {/* Diagnostic Button */}
            <button
                onClick={async () => {
                    // 1. Check Internet
                    if (!navigator.onLine) {
                        alert("⚠️ Tu dispositivo NO tiene conexión a Internet explícita. Por eso no se guardan los datos.");
                        // Proceed anyway to try
                    }

                    try {
                        const { doc, setDoc, enableNetwork } = await import('firebase/firestore');
                        const { db } = await import('../firebaseConfig');

                        // Force network enable just in case
                        await enableNetwork(db).catch(e => console.log("Network already enabled"));

                        await setDoc(doc(db, "_diagnostics", "test_connection"), {
                            timestamp: new Date().toISOString(),
                            user: user?.uid || 'anonymous',
                            device: 'android',
                            status: 'online'
                        });
                        alert("✅ ¡Conexión Exitosa! Los datos se están guardando en la nube.");
                    } catch (e) {
                        alert(`❌ Error de Firebase: ${e.code} - ${e.message}\n\nRevisa tu internet o las reglas de Firebase.`);
                    }
                }}
                style={{
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    border: 'none',
                    alignSelf: 'center',
                    marginTop: '10px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                🛠 DIAGNOSTICAR CONEXIÓN (CLICK AQUÍ)
            </button>

            <div className="raffles-container">
                {loading ? (
                    <div className="glass-panel empty-state">
                        <Loader size={48} style={{ opacity: 0.5, marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : error ? (
                    <div className="glass-panel empty-state" style={{ borderColor: '#ef4444' }}>
                        <h3 style={{ color: '#ef4444' }}>Error de conexión</h3>
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
