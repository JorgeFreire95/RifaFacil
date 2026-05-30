import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { ArrowLeft, User, Phone, Save, Share2 as Share, Check, X, Dices, Edit, Calendar } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const RaffleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRaffle, updateTicket, assignPrizeWinner } = useRaffle();
    const raffle = getRaffle(id);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPrizeIndex, setSelectedPrizeIndex] = useState(0);

    // Draw State
    const [showDrawModal, setShowDrawModal] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawNumber, setCurrentDrawNumber] = useState(null);
    const [winner, setWinner] = useState(null);
    const drawIntervalRef = useRef(null);

    // Modal State
    const [clientInfo, setClientInfo] = useState({ name: '', phone: '', paymentStatus: 'Pendiente' });

    if (!raffle) {
        return <div className="container">Rifa no encontrada</div>;
    }

    const handleTicketClick = (ticket) => {
        if (isDrawing) return; // Prevent clicks during draw
        Haptics.impact({ style: ImpactStyle.Light }); // Tactile feedback
        setSelectedTicket(ticket);
        setClientInfo({
            name: ticket.holder?.name || '',
            phone: ticket.holder?.phone || '',
            paymentStatus: ticket.holder?.paymentStatus || 'Pendiente'
        });
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

            // Light vibration during the "spinning"
            if (counter % 2 === 0) {
                Haptics.impact({ style: ImpactStyle.Light });
            }

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

        // Success vibration
        Haptics.notification({ type: NotificationType.Success });
    };

    const handleShare = async () => {
        Haptics.impact({ style: ImpactStyle.Medium });
        // Share logic placeholder...
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
                                <span>Sorteo: {raffle.drawDate ? new Date(raffle.drawDate.split('T')[0] + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sin fecha'} {raffle.drawTime && ` a las ${raffle.drawTime}`}</span>
                            </div>
                        )}
                        <div className="prizes-list" style={{ display: 'grid', gap: '8px', width: '100%', maxWidth: '400px' }}>
                            <h4 style={{ opacity: 0.9, marginBottom: '4px' }}>Premios (Selecciona uno para el sorteo):</h4>
                            {raffle.prizes.map((p, i) => {
                                const prizeName = typeof p === 'string' ? p : p.name;
                                const winnerInfo = typeof p === 'string' ? null : p.winner;
                                const isSelected = selectedPrizeIndex === i;

                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedPrizeIndex(i)}
                                        className={`prize-tag ${isSelected ? 'active' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                                            border: isSelected ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.15)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s',
                                            color: '#fff'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ 
                                                width: '8px', 
                                                height: '8px', 
                                                background: isSelected ? '#fbbf24' : '#a1a1aa', 
                                                borderRadius: '50%',
                                                boxShadow: isSelected ? '0 0 8px #fbbf24' : 'none'
                                            }} />
                                            <span style={{ fontWeight: isSelected ? '600' : '400' }}>{prizeName}</span>
                                        </div>
                                        {winnerInfo && (
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                color: '#fbbf24', 
                                                fontWeight: '700',
                                                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(251, 191, 36, 0.3)'
                                            }}>
                                                🏆 {winnerInfo.name} (N° {winnerInfo.number})
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
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
                                        ? (ticket.holder?.paymentStatus === 'Paga'
                                            ? 'rgba(34, 197, 94, 0.95)' // Green for Paid
                                            : 'rgba(239, 68, 68, 0.95)') // Red/Orange for Pending
                                        : (raffle.ticketColor || 'rgba(255, 255, 255, 0.15)'),
                                    border: `1px solid ${ticket.status === 'sold'
                                        ? (ticket.holder?.paymentStatus === 'Paga'
                                            ? 'rgba(34, 197, 94, 0.5)'
                                            : 'rgba(239, 68, 68, 0.5)')
                                        : 'rgba(255, 255, 255, 0.3)'}`,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    fontWeight: '700'
                                }}
                            >
                                <span className="ticket-number" style={{
                                    textShadow: raffle.ticketColor ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                }}>{ticket.number}</span>
                                {ticket.status === 'sold' && (
                                    <div className="ticket-status">
                                        {ticket.holder?.paymentStatus === 'Paga' ? 'Paga' : 'Pendiente'}
                                    </div>
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

                            <div className="input-wrapper">
                                <label className="form-label">
                                    Estado de Pago
                                </label>
                                <select
                                    className="input-field"
                                    value={clientInfo.paymentStatus || 'Pendiente'}
                                    onChange={e => setClientInfo({ ...clientInfo, paymentStatus: e.target.value })}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        color: '#fff',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        width: '100%',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="Pendiente" style={{ color: '#000' }}>Pendiente</option>
                                    <option value="Paga" style={{ color: '#000' }}>Paga</option>
                                </select>
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
                                    <div style={{ fontSize: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600 }}>{winner.holder.name}</div>
                                        <div style={{ fontSize: '1rem', opacity: 0.7 }}>{winner.holder.phone}</div>
                                        <span style={{
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: winner.holder.paymentStatus === 'Paga' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: winner.holder.paymentStatus === 'Paga' ? '#4ade80' : '#f87171',
                                            border: `1px solid ${winner.holder.paymentStatus === 'Paga' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                            marginTop: '6px'
                                        }}>
                                            {winner.holder.paymentStatus === 'Paga' ? 'Paga' : 'Pendiente'}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                                        Número Disponible
                                    </div>
                                )}

                                {winner.holder ? (
                                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '32px' }}>
                                        <button
                                            onClick={() => {
                                                if (winner && winner.holder && selectedPrizeIndex !== null) {
                                                    assignPrizeWinner(raffle.id, selectedPrizeIndex, {
                                                        name: winner.holder.name,
                                                        number: winner.number
                                                    });
                                                }
                                                setShowDrawModal(false);
                                            }}
                                            className="btn-primary"
                                            style={{ flex: 1, backgroundColor: '#22c55e', border: 'none', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
                                        >
                                            Validar
                                        </button>
                                        <button
                                            onClick={startDraw}
                                            className="btn-secondary"
                                            style={{ flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                                        >
                                            Al Agua
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '32px' }}>
                                        <button
                                            onClick={startDraw}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            Sortear de nuevo
                                        </button>
                                        <button
                                            onClick={() => setShowDrawModal(false)}
                                            className="btn-primary"
                                            style={{ flex: 1 }}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaffleDetails;
