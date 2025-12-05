import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import EventModal from './EventModal';
import {
    AlertCircle, Gavel, FileText, Users, Clock, CheckCircle2,
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const EVENT_COLORS = {
    prazo: '#EF4444',      // red-500
    audiencia: '#DC2626',  // red-600
    diligencia: '#3B82F6', // blue-500
    reuniao: '#A855F7',    // purple-500
    protocolo: '#22C55E',  // green-500
    intimacao: '#EAB308',  // yellow-500
    lembrete: '#FACC15',   // yellow-400
    google: '#4285F4',     // Google Blue
    default: '#6B7280'     // gray-500
};

const CustomToolbar = ({ date, onNavigate, view, onView, label }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="p-1.5 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm rounded-md transition-all text-gray-600 dark:text-gray-300"
                        title="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onNavigate('TODAY')}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm rounded-md transition-all"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="p-1.5 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm rounded-md transition-all text-gray-600 dark:text-gray-300"
                        title="Próximo"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white ml-2 capitalize font-display">
                    {label}
                </h2>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {[
                    { id: 'month', label: 'Mês' },
                    { id: 'week', label: 'Semana' },
                    { id: 'day', label: 'Dia' },
                    { id: 'agenda', label: 'Agenda' }
                ].map(v => (
                    <button
                        key={v.id}
                        onClick={() => onView(v.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === v.id
                            ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const EventComponent = ({ event }) => {
    const getIcon = () => {
        switch (event.type) {
            case 'prazo': return <AlertCircle className="w-3 h-3" />;
            case 'audiencia': return <Gavel className="w-3 h-3" />;
            case 'diligencia': return <FileText className="w-3 h-3" />;
            case 'reuniao': return <Users className="w-3 h-3" />;
            case 'protocolo': return <CheckCircle2 className="w-3 h-3" />;
            case 'google': return <CalendarIcon className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="flex items-center gap-1 overflow-hidden" title={event.title}>
            {getIcon()}
            <span className="truncate text-xs font-medium">{event.title}</span>
            {event.status === 'concluido' && <CheckCircle2 className="w-3 h-3 ml-auto opacity-70" />}
        </div>
    );
};

export default function AgendaCalendar({ filters }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Estados controlados para navegação
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');

    // Filtrar eventos
    const filteredEvents = events.filter(evt => {
        if (filters?.types && filters.types.length > 0 && !filters.types.includes(evt.type)) {
            return false;
        }
        if (filters?.status && filters.status !== 'todos') {
            const isConcluido = ['concluida', 'concluido', 'realizada', 'cancelada'].includes(evt.status);
            if (filters.status === 'concluido' && !isConcluido) return false;
            if (filters.status === 'pendente' && isConcluido) return false;
        }
        return true;
    });

    useEffect(() => {
        loadEvents(currentDate);
    }, [currentDate]); // Recarrega quando a data muda (navegação)

    const loadEvents = async (date) => {
        setLoading(true);
        try {
            const start = moment(date).startOf('month').subtract(1, 'month').format('YYYY-MM-DD');
            const end = moment(date).endOf('month').add(1, 'month').format('YYYY-MM-DD');

            const response = await api.get('/agenda', { params: { start, end } });

            const formattedEvents = (response.data.data || []).map(evt => ({
                ...evt,
                start: new Date(evt.start),
                end: new Date(evt.end),
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Erro ao carregar agenda:', err);
            toast.error('Erro ao carregar eventos');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    const handleViewChange = (newView) => {
        setCurrentView(newView);
    };

    const handleSelectSlot = (slotInfo) => {
        setSelectedSlot(slotInfo);
        setSelectedEvent(null);
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setSelectedSlot(null);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        loadEvents(currentDate);
    };

    const eventStyleGetter = (event) => {
        const backgroundColor = EVENT_COLORS[event.type] || EVENT_COLORS.default;
        const isConcluido = ['concluida', 'concluido', 'realizada'].includes(event.status);

        return {
            style: {
                backgroundColor: isConcluido ? '#9CA3AF' : backgroundColor,
                borderRadius: '4px',
                opacity: isConcluido ? 0.7 : 1,
                color: 'white',
                border: '0px',
                display: 'block',
                textDecoration: isConcluido ? 'line-through' : 'none'
            }
        };
    };

    return (
        <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
            <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', flex: 1 }}
                selectable

                // Controle de Estado
                date={currentDate}
                view={currentView}
                onNavigate={handleNavigate}
                onView={handleViewChange}

                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}

                eventPropGetter={eventStyleGetter}
                components={{
                    event: EventComponent,
                    toolbar: CustomToolbar // Toolbar customizada
                }}

                messages={{
                    noEventsInRange: "Não há eventos neste período."
                }}
            />

            {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            <EventModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleModalSuccess}
                selectedSlot={selectedSlot}
                selectedEvent={selectedEvent}
            />
        </div>
    );
}
