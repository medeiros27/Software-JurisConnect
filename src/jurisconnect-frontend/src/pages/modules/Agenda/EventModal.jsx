import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/shared/Modal';
import { Input } from '../../../components/shared/Input';
import { Button } from '../../../components/shared/Button';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function EventModal({ isOpen, onClose, onSuccess, selectedSlot, selectedEvent }) {
    const [formData, setFormData] = useState({
        titulo: '',
        tipo: 'reuniao',
        data_evento: '',
        hora_evento: '',
        duracao_minutos: 60,
        descricao: '',
        local: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (selectedEvent) {
                // Edição de evento existente
                const resource = selectedEvent.resource;
                setFormData({
                    titulo: resource.titulo,
                    tipo: resource.tipo,
                    data_evento: resource.data_evento ? resource.data_evento.split('T')[0] : '',
                    hora_evento: resource.hora_evento ? resource.hora_evento.slice(0, 5) : '',
                    duracao_minutos: resource.duracao_minutos || 60,
                    descricao: resource.descricao || '',
                    local: resource.local || ''
                });
            } else if (selectedSlot) {
                // Criação de novo evento
                const date = new Date(selectedSlot.start);
                setFormData({
                    titulo: '',
                    tipo: 'reuniao',
                    data_evento: date.toISOString().split('T')[0],
                    hora_evento: date.toTimeString().slice(0, 5),
                    duracao_minutos: 60,
                    descricao: '',
                    local: ''
                });
            }
        }
    }, [selectedEvent, selectedSlot, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (selectedEvent) {
                await api.put(`/agenda/${selectedEvent.original_id}`, formData);
                toast.success('Evento atualizado com sucesso!');
            } else {
                await api.post('/agenda', formData);
                toast.success('Evento criado com sucesso!');
            }
            onSuccess();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Erro ao salvar evento');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
        setLoading(true);
        try {
            await api.delete(`/agenda/${selectedEvent.original_id}`);
            toast.success('Evento excluído!');
            onSuccess();
        } catch (err) {
            toast.error('Erro ao excluir evento');
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = selectedEvent && selectedEvent.source !== 'agenda';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedEvent ? (isReadOnly ? 'Detalhes do Evento' : 'Editar Evento') : 'Novo Evento'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {isReadOnly && (
                    <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm mb-4">
                        ℹ️ Este evento é importado de {selectedEvent.source === 'demanda' ? 'uma Demanda' : 'Google Calendar'} e não pode ser editado aqui.
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <div className="flex gap-2 flex-wrap">
                        {['reuniao', 'audiencia', 'lembrete', 'outro'].map(type => (
                            <button
                                key={type}
                                type="button"
                                disabled={isReadOnly}
                                onClick={() => setFormData(prev => ({ ...prev, tipo: type }))}
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${formData.tipo === type
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <Input
                    label="Título *"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    disabled={isReadOnly}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Data *"
                        name="data_evento"
                        type="date"
                        value={formData.data_evento}
                        onChange={handleChange}
                        required
                        disabled={isReadOnly}
                    />
                    <Input
                        label="Hora"
                        name="hora_evento"
                        type="time"
                        value={formData.hora_evento}
                        onChange={handleChange}
                        disabled={isReadOnly}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Duração (min)"
                        name="duracao_minutos"
                        type="number"
                        value={formData.duracao_minutos}
                        onChange={handleChange}
                        disabled={isReadOnly}
                    />
                    <Input
                        label="Local"
                        name="local"
                        value={formData.local}
                        onChange={handleChange}
                        disabled={isReadOnly}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        name="descricao"
                        rows="3"
                        value={formData.descricao}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                    {selectedEvent && !isReadOnly && (
                        <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
                            Excluir
                        </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Fechar
                        </Button>
                        {!isReadOnly && (
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
