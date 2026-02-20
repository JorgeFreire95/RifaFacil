import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { ArrowLeft, User, Phone, Save, Share2 as Share, Check, X, Dices, Edit, Calendar } from 'lucide-react';

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
        <div className="container details-container">
            <header className="details-header">
                <button onClick={() => navigate('/')} className="btn-back">
                    <ArrowLeft size={24} />
                </button>
                <div className="header-actions">
                    <button onClick={() => navigate(`/edit/${raffle.id}`)} className="btn-secondary">
                        <Edit size={20} />
                    </button>
                    <button onClick={startDraw} className="btn-draw">
                        <Dices size={20} /> <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sorteo</span>
                    </button>
                    <button className="btn-back">
                        <Share size={24} />
                    </button>
                </div>
            </header>

            {/* Unified Raffle Board */}
            <div className="raffle-board">

                {/* Background Layer */}
                <div className="board-background" style={{
                    backgroundImage: raffle.template === 'image' && raffle.image
                        ? `url(${raffle.image})`
                        : `linear-gradient(135deg, ${raffle.ticketColor || '#4f46e5'} 0%, ${raffle.ticketColor ? raffle.ticketColor + 'aa' : '#7e22ce'} 100%)`,
                    opacity: raffle.template === 'image' ? 0.6 : 0.8,
                }} />

                {/* Overlay for contrast if needed */}
                <div className="board-overlay" />

                <div className="board-content">
                    {/* Info Section */}
                    <div className="board-header">
                        <h2 className="board-title">{raffle.title}</h2>
                        {raffle.drawDate && (
                            <div className="draw-date-badge" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.9rem',
                                opacity: 0.9,
                                marginBottom: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                width: 'fit-content'
                            }}>
                                <Calendar size={16} />
                                <span>Sorteo: {new Date(raffle.drawDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        )}
                        <div className="prizes-list">
                            <h4 style={{ opacity: 0.9 }}>Premios:</h4>
                            {raffle.prizes.map((p, i) => (
                                <div key={i} className="prize-tag">
                                    <div style={{ width: '6px', height: '6px', background: '#fbbf24', borderRadius: '50%' }} />
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="ticket-grid">
                        {raffle.tickets.map((ticket) => (
                            <button
                                key={ticket.number}
                                onClick={() => handleTicketClick(ticket)}
                                className="ticket-btn"
                                style={{
                                    backgroundColor: ticket.status === 'sold'
                                        ? 'rgba(239, 68, 68, 0.9)'
                                        : (raffle.ticketColor || 'rgba(255, 255, 255, 0.15)'),
                                    // Removed backdropFilter entirely as it causes massive lag on mobile
                                    border: `1px solid ${ticket.status === 'sold'
                                        ? 'rgba(239, 68, 68, 0.5)'
                                        : 'rgba(255, 255, 255, 0.3)'}`,
                                    // Simplified shadow
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    fontWeight: '700'
                                }}
                            >
                                <span className="ticket-number" style={{
                                    textShadow: raffle.ticketColor ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                }}>{ticket.number}</span>
                                {ticket.status === 'sold' && (
                                    <div className="ticket-status">Vendido</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ticket Info Modal Overlay */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <div className="modal-header">
                            <h3>Número {selectedTicket?.number}</h3>
                            <button onClick={() => setModalOpen(false)} className="btn-back">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTicket} className="auth-form">
                            <div className="input-wrapper">
                                <label className="form-label">
                                    <User size={16} style={{ display: 'inline', marginRight: '8px' }} /> Nombre y Apellido
                                </label>
                                <input
                                    className="input-field"
                                    value={clientInfo.name}
                                    onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div className="input-wrapper">
                                <label className="form-label">
                                    <Phone size={16} style={{ display: 'inline', marginRight: '8px' }} /> Teléfono
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
                                <button type="button" onClick={handleReleaseTicket} className="btn-release">
                                    Liberar Número
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Draw Modal Overlay */}
            {showDrawModal && (
                <div className="modal-overlay" style={{ zIndex: 60, background: 'rgba(0,0,0,0.9)' }}>
                    <div className="draw-container">
                        {!winner ? (
                            <>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', opacity: 0.8 }}>Sorteando...</h3>
                                <div className="draw-number-lg">
                                    {currentDrawNumber}
                                </div>
                            </>
                        ) : (
                            <div className="glass-panel winner-panel">
                                <div style={{ marginBottom: '16px' }}>🎉 ¡Tenemos Ganador! 🎉</div>
                                <div className="winner-number">
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
