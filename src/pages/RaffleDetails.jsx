import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { ArrowLeft, User, Phone, Save, Share2 as Share, Check, X, Dices, Edit } from 'lucide-react';

const RaffleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRaffle, updateTicket } = useRaffle();
    const raffle = getRaffle(id);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Draw State
    const [showDrawModal, setShowDrawModal] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawNumber, setCurrentDrawNumber] = useState(null);
    const [winner, setWinner] = useState(null);
    const drawIntervalRef = useRef(null);

    // Modal State
    const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });

    if (!raffle) {
        return <div className="container">Rifa no encontrada</div>;
    }

    const handleTicketClick = (ticket) => {
        if (isDrawing) return; // Prevent clicks during draw
        setSelectedTicket(ticket);
        setClientInfo(ticket.holder || { name: '', phone: '' });
        setModalOpen(true);
    };

    const handleSaveTicket = (e) => {
        e.preventDefault();
        if (!clientInfo.name) return alert('El nombre es obligatorio');

        updateTicket(raffle.id, selectedTicket.number, clientInfo);
        setModalOpen(false);
    };

    const handleReleaseTicket = () => {
        if (!window.confirm('¿Liberar este número?')) return;
        updateTicket(raffle.id, selectedTicket.number, null);
        setModalOpen(false);
    }

    const startDraw = () => {
        setShowDrawModal(true);
        setIsDrawing(true);
        setWinner(null);
        setCurrentDrawNumber(null);

        let counter = 0;
        const maxIterations = 30; // How many numbers to flash
        const speed = 100; // ms

        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);

        drawIntervalRef.current = setInterval(() => {
            // Pick random number for animation
            const randomNum = Math.floor(Math.random() * raffle.ticketCount) + 1;
            setCurrentDrawNumber(randomNum);
            counter++;

            if (counter > maxIterations) {
                clearInterval(drawIntervalRef.current);
                finishDraw();
            }
        }, speed);
    };

    const finishDraw = () => {
        // Pick the actual winner
        const winningNumber = Math.floor(Math.random() * raffle.ticketCount) + 1;
        const winningTicket = raffle.tickets.find(t => t.number === winningNumber);

        setCurrentDrawNumber(winningNumber);
        setWinner(winningTicket);
        setIsDrawing(false);
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate(`/edit/${raffle.id}`)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Edit size={20} />
                    </button>
                    <button onClick={startDraw} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Dices size={20} /> <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sorteo</span>
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'white' }}>
                        <Share size={24} />
                    </button>
                </div>
            </header>

            {/* Unified Raffle Board */}
            <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                padding: '20px',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
            }}>

                {/* Background Layer */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    backgroundImage: raffle.template === 'image' && raffle.image
                        ? `url(${raffle.image})`
                        : 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)', // Default 'random' gradient
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: raffle.template === 'image' ? 0.6 : 0.8, // Adjust opacity for readability
                }} />

                {/* Overlay for contrast if needed */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
                    background: 'rgba(15, 23, 42, 0.4)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Info Section */}
                    <div style={{ marginBottom: '24px', textAlign: 'center', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '12px', fontWeight: 800 }}>{raffle.title}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                            <h4 style={{ opacity: 0.9 }}>Premios:</h4>
                            {raffle.prizes.map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '20px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#fbbf24', borderRadius: '50%' }} />
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                        gap: '12px'
                    }}>
                        {raffle.tickets.map((ticket) => (
                            <button
                                key={ticket.number}
                                onClick={() => handleTicketClick(ticket)}
                                style={{
                                    background: ticket.status === 'sold'
                                        ? 'rgba(239, 68, 68, 0.8)' // Solid red for sold
                                        : 'rgba(255, 255, 255, 0.15)', // Glassy white for available
                                    backdropFilter: 'blur(4px)',
                                    border: `1px solid ${ticket.status === 'sold' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.3)'}`,
                                    borderRadius: '12px',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}
                            >
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{ticket.number}</span>
                                {ticket.status === 'sold' && (
                                    <div style={{ fontSize: '0.6rem', color: 'white', marginTop: '2px', fontWeight: '600' }}>Vendido</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ticket Info Modal Overlay */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 50
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px', background: '#1e1b4b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3>Número {selectedTicket?.number}</h3>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTicket} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                    <User size={16} /> Nombre y Apellido
                                </label>
                                <input
                                    className="input-field"
                                    value={clientInfo.name}
                                    onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                    <Phone size={16} /> Teléfono
                                </label>
                                <input
                                    className="input-field"
                                    value={clientInfo.phone}
                                    onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                    placeholder="+56 9 1234 5678"
                                    type="tel"
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                                <Save size={18} /> Guardar Información
                            </button>

                            {selectedTicket?.status === 'sold' && (
                                <button type="button" onClick={handleReleaseTicket} style={{
                                    background: 'transparent',
                                    border: '1px solid var(--danger)',
                                    color: 'var(--danger)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer'
                                }}>
                                    Liberar Número
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Draw Modal Overlay */}
            {showDrawModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 60
                }}>
                    <div style={{ textAlign: 'center', color: 'white', width: '100%' }}>
                        {!winner ? (
                            <>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', opacity: 0.8 }}>Sorteando...</h3>
                                <div style={{
                                    fontSize: '6rem',
                                    fontWeight: '800',
                                    textShadow: '0 0 40px var(--primary)',
                                    animation: 'bounce 0.5s infinite alternate'
                                }}>
                                    {currentDrawNumber}
                                </div>
                            </>
                        ) : (
                            <div className="glass-panel" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))', border: '1px solid #4ade80' }}>
                                <div style={{ marginBottom: '16px' }}>🎉 ¡Tenemos Ganador! 🎉</div>
                                <div style={{
                                    fontSize: '5rem',
                                    fontWeight: '800',
                                    color: '#4ade80',
                                    marginBottom: '16px'
                                }}>
                                    {winner.number}
                                </div>

                                {winner.holder ? (
                                    <div style={{ fontSize: '1.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{winner.holder.name}</div>
                                        <div style={{ fontSize: '1rem', opacity: 0.7 }}>{winner.holder.phone}</div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                                        Número Disponible
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowDrawModal(false)}
                                    className="btn-primary"
                                    style={{ marginTop: '32px', width: '100%' }}
                                >
                                    Cerrar Sorteo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaffleDetails;
