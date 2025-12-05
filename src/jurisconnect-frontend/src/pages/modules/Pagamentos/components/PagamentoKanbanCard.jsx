import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, DollarSign, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PagamentoKanbanCard = ({ pagamento, index, onClick }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const isDateValid = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    const getRelativeDate = (dateString) => {
        if (!isDateValid(dateString)) return 'Data inválida';
        const date = new Date(dateString);

        if (isToday(date)) return 'Vence Hoje';

        return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    };

    const isOverdue = pagamento.status !== 'pago' &&
        isDateValid(pagamento.data_vencimento) &&
        isPast(new Date(pagamento.data_vencimento)) &&
        !isToday(new Date(pagamento.data_vencimento));

    return (
        <Draggable draggableId={String(pagamento.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(pagamento)}
                    className={`
                        bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm mb-3 cursor-pointer
                        transition-all duration-200 group relative overflow-hidden
                        ${isOverdue ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-700'}
                        ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary-500 rotate-2 scale-105 z-50' : 'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700'}
                    `}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    {/* Overdue Indicator */}
                    {isOverdue && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    )}

                    {/* Header: Fatura & Status */}
                    <div className="flex justify-between items-start mb-3 pl-2">
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            #{pagamento.numero_fatura || pagamento.id}
                        </span>
                        {pagamento.status === 'pago' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                                <CheckCircle size={10} /> PAGO
                            </span>
                        )}
                        {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                                <AlertCircle size={10} /> ATRASADO
                            </span>
                        )}
                    </div>

                    {/* Main Info: Value & Entity */}
                    <div className="pl-2 mb-3">
                        <div className={`text-lg font-bold mb-1 ${pagamento.tipo === 'receber' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(pagamento.valor)}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
                            {pagamento.demanda?.cliente?.nome_fantasia || pagamento.correspondente?.nome_fantasia || 'Entidade N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1 mt-1">
                            <FileText size={12} />
                            {pagamento.demanda ? `Demanda: ${pagamento.demanda.titulo}` : 'Avulso'}
                        </p>
                    </div>

                    {/* Footer: Date */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700 pl-2">
                        <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                            <Calendar size={14} />
                            <span>{isDateValid(pagamento.data_vencimento) ? new Date(pagamento.data_vencimento).toLocaleDateString() : 'Sem data'}</span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span>{getRelativeDate(pagamento.data_vencimento)}</span>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
