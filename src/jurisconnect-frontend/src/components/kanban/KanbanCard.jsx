import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MapPin, Calendar, DollarSign, AlertTriangle, User } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const KanbanCard = ({ demanda, index, onClick }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const getRelativeDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);

        if (isToday(date)) return 'Hoje';
        if (isTomorrow(date)) return 'Amanhã';

        return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    };

    const getTypeColor = (type) => {
        const colors = {
            audiencia: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
            diligencia: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            protocolo: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
            copias: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    };

    const saldo = (Number(demanda.valor_cobrado) || 0) - (Number(demanda.valor_custo) || 0);
    const hasLocation = demanda.cidade && demanda.estado;

    // Urgency Logic
    const isUrgent = () => {
        if (!demanda.data_agendamento) return false;
        const agendamento = new Date(demanda.data_agendamento);
        const agora = new Date();
        const diffHoras = (agendamento - agora) / (1000 * 60 * 60);
        return diffHoras <= 48 && diffHoras > 0 && (demanda.status === 'rascunho' || !demanda.correspondente_id);
    };

    return (
        <Draggable draggableId={String(demanda.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(demanda)}
                    className={`
            bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-3 cursor-pointer
            hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 group relative overflow-hidden
            ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary-500 rotate-2 scale-105 z-50' : ''}
          `}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    {/* Urgency Indicator Strip */}
                    {isUrgent() && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                    )}

                    {/* Header: Protocol & Type */}
                    <div className="flex justify-between items-start mb-3 pl-2">
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            #{demanda.numero_protocolo || demanda.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${getTypeColor(demanda.tipo_demanda)}`}>
                            {demanda.tipo_demanda?.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Title & Client */}
                    <div className="pl-2 mb-3">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {demanda.titulo}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            {demanda.cliente?.nome_fantasia || 'Cliente não informado'}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 pl-2 mb-3">
                        {/* Date */}
                        <div className={`flex items-center gap-1.5 text-xs ${isUrgent() ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                            <Calendar size={14} className={isUrgent() ? 'animate-pulse' : ''} />
                            <span className="flex flex-col leading-tight">
                                <span>{getRelativeDate(demanda.data_agendamento) || '-'}</span>
                                {demanda.data_agendamento && (
                                    <span className="text-[10px] opacity-75">
                                        {new Date(demanda.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin size={14} />
                            <span className="truncate max-w-[100px]" title={hasLocation ? `${demanda.cidade} - ${demanda.estado}` : 'Sem local'}>
                                {hasLocation ? `${demanda.cidade} - ${demanda.estado}` : '-'}
                            </span>
                        </div>
                    </div>

                    {/* Footer: Financial & Correspondent */}
                    <div className="flex justify-between items-end pt-3 border-t border-gray-100 dark:border-gray-700 pl-2">
                        {/* Correspondent Avatar/Name */}
                        <div className="flex items-center gap-2 max-w-[60%]">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${demanda.correspondente ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                {demanda.correspondente?.nome_fantasia ? demanda.correspondente.nome_fantasia.charAt(0).toUpperCase() : <User size={12} />}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate" title={demanda.correspondente?.nome_fantasia}>
                                {demanda.correspondente?.nome_fantasia || 'Sem corresp.'}
                            </span>
                        </div>

                        {/* Financial Summary */}
                        <div className="text-right">
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Saldo</div>
                            <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {saldo < 0 && <AlertTriangle size={10} />}
                                {formatCurrency(saldo)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
