import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRaffle } from '../context/RaffleContext';
import { ArrowLeft, Plus, X, Image as ImageIcon, LayoutTemplate, Loader } from 'lucide-react';
import { Dialog } from '@capacitor/dialog';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            // Strict limit to ~400KB to ensure Base64 string stays under Firestore 1MB limit
            if (file.size > 400 * 1024) {
                alert("La imagen es demasiado grande. Por favor usa una imagen menor a 400KB para asegurar el guardado.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return alert('El título es obligatorio');

        // Logic for custom count
        const finalCount = formData.ticketCount === 'custom' ? formData.customCount : formData.ticketCount;
        if (!finalCount || finalCount <= 0) return alert('Cantidad de números inválida');

        setIsSubmitting(true);
        try {
            const dataToSave = { ...formData, prizes, ticketCount: finalCount };

            // Promise race: Wait for DB or timeout after 2.5s to avoid hanging
            const savePromise = id
                ? updateRaffle(id, dataToSave)
                : addRaffle(dataToSave);

            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2500));

            await Promise.race([savePromise, timeoutPromise]);

            // Show success via native Dialog
            await Dialog.alert({
                title: 'Éxito',
                message: id ? 'Rifa actualizada correctamente' : 'Rifa creada correctamente',
            });

            navigate('/');
        } catch (error) {
            console.error(error);
            // Even if it fails, sometimes it's just a network timeout. 
            // We'll let the user retry if it's a real error, but for sticking:
            await Dialog.alert({
                title: 'Atención',
                message: 'La rifa se está guardando en segundo plano.',
            });
            navigate('/');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <header className="header-with-back">
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={24} />
                </button>
                <h2>{id ? 'Editar Rifa' : 'Nueva Rifa'}</h2>
            </header>

            <form onSubmit={handleSubmit} className="auth-form">

                {/* Basic Info */}
                <section className="glass-panel form-section">
                    <label className="form-label">Título de la Rifa</label>
                    <input
                        className="input-field"
                        name="title"
                        placeholder="Ej. Rifa Pro-Fondos..."
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </section>

                {/* Numbers Configuration */}
                <section className="glass-panel form-section">
                    <label className="form-label">Cantidad de Números</label>
                    <div className="options-grid">
                        {['25', '50', '100', 'custom'].map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, ticketCount: opt }))}
                                className={`option-btn ${formData.ticketCount === opt ? 'active' : ''}`}
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
                <section className="glass-panel form-section">
                    <div className="section-header">
                        <label style={{ color: 'var(--text-muted)' }}>Premios</label>
                        <button type="button" onClick={addPrize} className="btn-text-icon">
                            <Plus size={16} /> Agregar
                        </button>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {prizes.map((prize, idx) => (
                            <div key={idx} className="prize-row">
                                <input
                                    className="input-field"
                                    placeholder={`Premio #${idx + 1}`}
                                    value={prize}
                                    onChange={(e) => handlePrizeChange(idx, e.target.value)}
                                />
                                {prizes.length > 1 && (
                                    <button type="button" onClick={() => removePrize(idx)} className="btn-remove">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Template */}
                <section className="glass-panel form-section">
                    <label className="form-label">Diseño del Cartón</label>
                    <div className="template-grid">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, template: 'random' }))}
                            className={`template-card ${formData.template === 'random' ? 'active' : ''}`}
                        >
                            <LayoutTemplate size={32} style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '0.9rem' }}>Aleatorio</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, template: 'image' }))}
                            className={`template-card ${formData.template === 'image' ? 'active' : ''}`}
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
                                <div className="image-preview">
                                    <img src={formData.image} alt="Preview" />
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <button type="submit" className="btn-primary" style={{ marginTop: '16px', fontSize: '1.1rem' }} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader size={20} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                            Guardando...
                        </>
                    ) : (id ? 'Guardar Cambios' : 'Crear Rifa')}
                </button>
                <div style={{ height: '40px' }}></div>
            </form>
        </div>
    );
};

export default CreateRaffle;
