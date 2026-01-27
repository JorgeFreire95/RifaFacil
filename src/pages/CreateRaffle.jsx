import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { ArrowLeft, Plus, X, Image as ImageIcon, LayoutTemplate } from 'lucide-react';

const CreateRaffle = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if editing
    const { addRaffle, getRaffle, updateRaffle } = useRaffle();

    const [formData, setFormData] = useState({
        title: '',
        ticketCount: '50',
        customCount: '',
        template: 'random',
        image: null
    });

    const [prizes, setPrizes] = useState(['']);

    useEffect(() => {
        if (id) {
            const raffle = getRaffle(id);
            if (raffle) {
                const isCustom = !['25', '50', '100'].includes(String(raffle.ticketCount));
                setFormData({
                    title: raffle.title,
                    ticketCount: isCustom ? 'custom' : String(raffle.ticketCount),
                    customCount: isCustom ? String(raffle.ticketCount) : '',
                    template: raffle.template,
                    image: raffle.image
                });
                setPrizes(raffle.prizes.length > 0 ? raffle.prizes : ['']);
            }
        }
    }, [id, getRaffle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrizeChange = (index, value) => {
        const newPrizes = [...prizes];
        newPrizes[index] = value;
        setPrizes(newPrizes);
    };

    const addPrize = () => setPrizes([...prizes, '']);

    const removePrize = (index) => {
        if (prizes.length === 1) return;
        const newPrizes = prizes.filter((_, i) => i !== index);
        setPrizes(newPrizes);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return alert('El título es obligatorio');

        // Logic for custom count
        const finalCount = formData.ticketCount === 'custom' ? formData.customCount : formData.ticketCount;
        if (!finalCount || finalCount <= 0) return alert('Cantidad de números inválida');

        if (id) {
            updateRaffle(id, { ...formData, prizes, ticketCount: finalCount });
        } else {
            addRaffle({ ...formData, prizes, ticketCount: finalCount });
        }
        navigate('/');
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2>{id ? 'Editar Rifa' : 'Nueva Rifa'}</h2>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>

                {/* Basic Info */}
                <section className="glass-panel" style={{ padding: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Título de la Rifa</label>
                    <input
                        className="input-field"
                        name="title"
                        placeholder="Ej. Rifa Pro-Fondos..."
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </section>

                {/* Numbers Configuration */}
                <section className="glass-panel" style={{ padding: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '16px', color: 'var(--text-muted)' }}>Cantidad de Números</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        {['25', '50', '100', 'custom'].map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, ticketCount: opt }))}
                                style={{
                                    background: formData.ticketCount === opt ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${formData.ticketCount === opt ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {opt === 'custom' ? 'Personalizar' : opt}
                            </button>
                        ))}
                    </div>

                    {formData.ticketCount === 'custom' && (
                        <input
                            className="input-field"
                            name="customCount"
                            type="number"
                            placeholder="Ingresa cantidad..."
                            value={formData.customCount}
                            onChange={handleInputChange}
                        />
                    )}
                </section>

                {/* Prizes */}
                <section className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <label style={{ color: 'var(--text-muted)' }}>Premios</label>
                        <button type="button" onClick={addPrize} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Plus size={16} /> Agregar
                        </button>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {prizes.map((prize, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="input-field"
                                    placeholder={`Premio #${idx + 1}`}
                                    value={prize}
                                    onChange={(e) => handlePrizeChange(idx, e.target.value)}
                                />
                                {prizes.length > 1 && (
                                    <button type="button" onClick={() => removePrize(idx)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: 'none', borderRadius: '10px', width: '44px', cursor: 'pointer' }}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Template */}
                <section className="glass-panel" style={{ padding: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '16px', color: 'var(--text-muted)' }}>Diseño del Cartón</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, template: 'random' }))}
                            style={{
                                flex: 1,
                                padding: '20px',
                                borderRadius: '12px',
                                background: formData.template === 'random' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${formData.template === 'random' ? 'var(--primary)' : 'var(--glass-border)'}`,
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: 'white'
                            }}
                        >
                            <LayoutTemplate size={32} style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '0.9rem' }}>Aleatorio</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, template: 'image' }))}
                            style={{
                                flex: 1,
                                padding: '20px',
                                borderRadius: '12px',
                                background: formData.template === 'image' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${formData.template === 'image' ? 'var(--primary)' : 'var(--glass-border)'}`,
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: 'white'
                            }}
                        >
                            <ImageIcon size={32} style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '0.9rem' }}>Imagen</div>
                        </button>
                    </div>

                    {formData.template === 'image' && (
                        <div style={{ marginTop: '16px' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ width: '100%', color: 'var(--text-muted)' }}
                            />
                            {formData.image && (
                                <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <img src={formData.image} alt="Preview" style={{ width: '100%', display: 'block' }} />
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <button type="submit" className="btn-primary" style={{ marginTop: '16px', fontSize: '1.1rem' }}>
                    {id ? 'Guardar Cambios' : 'Crear Rifa'}
                </button>
                <div style={{ height: '40px' }}></div>
            </form>
        </div>
    );
};

export default CreateRaffle;
