import React, { useState, useEffect } from 'react';
import AgendaCalendar from './AgendaCalendar';
import AgendaAlerts from './AgendaAlerts';
import AgendaSidebar from './AgendaSidebar';
import EventModal from './EventModal';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';

export default function Agenda() {
    const { user, initAuth } = useAuthStore();
    const [filters, setFilters] = useState({
        types: [], // Array de tipos selecionados (vazio = todos?) Não, vazio = nenhum? Sidebar logic: toggle.
        // Melhor: inicializar com todos ou nenhum? Se vazio = todos no Calendar.
        status: 'todos'
    });
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            handleGoogleCallback(code);
        }
    }, []);

    const handleGoogleCallback = async (code) => {
        const toastId = toast.loading('Conectando ao Google...');
        try {
            await api.post('/agenda/google-callback', { code });
            toast.success('Conectado ao Google Calendar!', { id: toastId });
            window.history.replaceState({}, document.title, window.location.pathname);
            initAuth();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao conectar Google Calendar', { id: toastId });
        }
    };

    const handleNewEvent = () => {
        setShowCreateModal(true);
    };

    const handleModalSuccess = () => {
        setShowCreateModal(false);
        // O Calendar vai precisar recarregar. 
        // Como o Calendar carrega no mount, e o modal success fecha o modal,
        // precisamos forçar o reload do Calendar.
        // Uma forma é passar uma key ou um contador de refresh.
        // Ou melhor: O AgendaCalendar já tem seu próprio modal e loadEvents.
        // Se criarmos por fora, precisamos avisar o calendar.
        // Vou passar uma prop `refreshTrigger` para o Calendar.
        setRefreshTrigger(prev => prev + 1);
    };

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Sidebar */}
                <AgendaSidebar
                    filters={filters}
                    setFilters={setFilters}
                    onNewEvent={handleNewEvent}
                />

                {/* Área Principal (Calendário) */}
                <div className="flex-1 min-w-0 h-full flex flex-col">
                    <AgendaCalendar
                        filters={filters}
                        key={refreshTrigger} // Força remount/reload simples ao atualizar
                    />
                </div>

                {/* Painel Direito (Alertas) */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-6 overflow-y-auto">
                    <AgendaAlerts />

                    {/* Legenda (Opcional, já que a sidebar tem os tipos) */}
                    {/* Pode ser movido para dentro do AgendaAlerts ou removido se redundante */}
                </div>
            </div>

            {/* Modal de Criação (Acionado pela Sidebar) */}
            <EventModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleModalSuccess}
                selectedSlot={{ start: new Date(), end: new Date() }} // Default para hoje
                selectedEvent={null}
            />
        </div>
    );
}
