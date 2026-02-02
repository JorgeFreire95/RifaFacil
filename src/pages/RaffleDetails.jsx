import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { ArrowLeft, User, Phone, Save, Share2 as Share, Check, X, Dices, Edit } from 'lucide-react';

const TicketItem = React.memo(({ ticket, ticketColor, onClick }) => {
    // Calculated styles to avoid re-calculation during render
    const isSold = ticket.status === 'sold';
    const baseColor = ticketColor || '#4f46e5';

    // Optimized styles: Removed backdrop-filter, reduced shadow complexity
    const style = {
        backgroundColor: isSold
            ? 'rgba(239, 68, 68, 0.9)'
            : (ticketColor ? baseColor + 'E6' : 'rgba(255, 255, 255, 0.2)'),
        borderColor: isSold
            ? 'rgba(239, 68, 68, 0.5)'
            : (ticketColor ? 'rgba(255,255,255,0.5)' : 'rgba(255, 255, 255, 0.3)'),
        boxShadow: !isSold && ticketColor ? `0 2px 4px ${baseColor}40` : 'none', // Simplified shadow
        borderWidth: '1px',
        borderStyle: 'solid',
        color: 'white'
    };

    return (
        <button
            onClick={() => onClick(ticket)}
            className="ticket-btn" // Keep basic layout classes
            style={style}
        >
            <span className="ticket-number" style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.3)', // Simplified text shadow
                fontSize: '1.25rem'
            }}>
                {ticket.number}
            </span>
            {isSold && (
                <div className="ticket-status">Vendido</div>
            )}
        </button>
    );
}, (prev, next) => {
    // Custom comparison for performance
    return prev.ticket.status === next.ticket.status &&
        prev.ticket.number === next.ticket.number &&
        prev.ticketColor === next.ticketColor;
});

const RaffleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getRaffle, updateTicket } = useRaffle();
    const raffle = getRaffle(id);

    // Memoize the tickets rendering to avoid mapping on every small state change
    const ticketList = React.useMemo(() => {
        if (!raffle) return null;
        return raffle.tickets.map((ticket) => (
            <TicketItem
                key={ticket.number}
                ticket={ticket}
                ticketColor={raffle.ticketColor}
                onClick={handleTicketClick}
            />
        ));
    }, [raffle?.tickets, raffle?.ticketColor]); // Dependencies

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // ... (Rest of state remains the same)

    // We need to hoist handleTicketClick to be stable or use useCallback, 
    // but since it uses state setters from the component, we define it here.
    // However, for TicketItem memo to work effectively, the function reference shouldn't change often.
    // Ideally we wrap handleTicketClick in useCallback, but it accesses 'isDrawing' which might change.
    // For scroll performance, 'isDrawing' usually doesn't change *during* scroll.

    // Use a ref to access the latest isDrawing value inside the memoized callback
    const isDrawingRef = useRef(isDrawing);
    // Update ref whenever state changes
    useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);

    // Re-defining handler for clarity in this large replacement block:
    const handleTicketClick = React.useCallback((ticket) => {
        // Prevent clicks during draw using ref to avoid breaking memoization
        if (isDrawingRef.current) return;

        setSelectedTicket(ticket);
        setClientInfo(ticket.holder || { name: '', phone: '' });
        setModalOpen(true);
    }, []); // Removed isDrawing dependency check for now or handle it differently if critical. 
    // Actually, we can just check a ref if needed, but let's stick to the simpler version.
    // If isDrawing is needed, we should use a ref.

    // ... (rest of the component logic)


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
                    <div className="ticket-grid" style={{ contentVisibility: 'auto' }}>
                        {ticketList}
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
