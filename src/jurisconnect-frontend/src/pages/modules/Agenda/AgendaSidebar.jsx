import React from 'react';
import { Plus, Calendar as CalendarIcon, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/shared/Button';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

const EVENT_TYPES = [
    { id: 'prazo', label: 'Prazos', color: 'bg-red-500', border: 'border-red-500' },
    { id: 'audiencia', label: 'Audiências', color: 'bg-red-600', border: 'border-red-600' },
    { id: 'diligencia', label: 'Diligências', color: 'bg-blue-500', border: 'border-blue-500' },
    { id: 'reuniao', label: 'Reuniões', color: 'bg-purple-500', border: 'border-purple-500' },
    { id: 'protocolo', label: 'Protocolos', color: 'bg-green-500', border: 'border-green-500' },
    { id: 'intimacao', label: 'Intimações', color: 'bg-yellow-500', border: 'border-yellow-500' },
    { id: 'lembrete', label: 'Lembretes', color: 'bg-yellow-400', border: 'border-yellow-400' },
];

export default function AgendaSidebar({ filters, setFilters, onNewEvent }) {
    const { user } = useAuthStore();

    const toggleType = (typeId) => {
        const currentTypes = filters.types || [];
        const newTypes = currentTypes.includes(typeId)
            ? currentTypes.filter(t => t !== typeId)
            : [...currentTypes, typeId];

        setFilters(prev => ({ ...prev, types: newTypes }));
    };

    const handleConnectGoogle = async () => {
        try {
            const { data } = await api.post('/agenda/google-auth');
            window.location.href = data.url;
        } catch (err) {
            console.error(err);
            toast.error('Erro ao iniciar conexão com Google');
        }
    };

    return (
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
            {/* Botão Novo Evento */}
            <Button
                className="w-full justify-center py-3 shadow-md hover:shadow-lg transition-all"
                onClick={onNewEvent}
            >
                <Plus className="w-5 h-5 mr-2" />
                Novo Evento
            </Button>

            {/* Mini Calendário (Placeholder visual por enquanto) */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hidden lg:block">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
                    <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
                    {/* Mock de dias */}
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${i === 15 ? 'bg-primary-100 text-primary-700 font-bold' : ''}`}>
                            {i + 1 > 31 ? i - 30 : i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Filtros de Tipo */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Minhas Agendas
                </h3>
                <div className="space-y-2">
                    {EVENT_TYPES.map(type => {
                        const isSelected = (filters.types || []).includes(type.id);
                        return (
                            <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isSelected}
                                        onChange={() => toggleType(type.id)}
                                    />
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? type.color + ' border-transparent' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                    {type.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Filtros de Status */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Status
                </h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded text-primary-600 focus:ring-primary-500"
                            checked={filters.status !== 'concluido'}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.checked ? 'todos' : 'concluido' }))}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mostrar Pendentes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded text-primary-600 focus:ring-primary-500"
                            checked={filters.status !== 'pendente'}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.checked ? 'todos' : 'pendente' }))}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mostrar Concluídos</span>
                    </label>
                </div>
            </div>

            {/* Google Calendar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    Google Calendar
                </h3>
                {user?.google_access_token ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sincronizado</span>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={handleConnectGoogle}
                    >
                        Conectar Google
                    </Button>
                )}
            </div>
        </div>
    );
}
