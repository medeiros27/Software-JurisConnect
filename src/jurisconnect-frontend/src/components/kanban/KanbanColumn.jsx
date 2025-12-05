import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { DollarSign, Inbox } from 'lucide-react';

export const KanbanColumn = ({ columnId, title, demandas, onCardClick }) => {
    const getStatusColor = (status) => {
        const colors = {
            rascunho: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
            pendente: 'border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/20',
            em_andamento: 'border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20',
            aguardando_correspondente: 'border-indigo-200 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/20',
            concluida: 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20',
            cancelada: 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20'
        };
        return colors[status] || 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    };

    const totalSaldo = demandas.reduce((acc, d) => {
        const saldo = (Number(d.valor_cobrado) || 0) - (Number(d.valor_custo) || 0);
        return acc + saldo;
    }, 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="flex flex-col h-full min-w-[320px] w-[320px] flex-shrink-0">
            {/* Column Header */}
            <div className={`flex flex-col p-3 mb-3 rounded-xl border-t-4 bg-white dark:bg-gray-800 shadow-sm ${getStatusColor(columnId)}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">
                        {title}
                    </h3>
                    <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-600">
                        {demandas.length}
                    </span>
                </div>

                {/* Column Financial Summary */}
                {demandas.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <DollarSign size={12} />
                        <span>Total:</span>
                        <span className={totalSaldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                            {formatCurrency(totalSaldo)}
                        </span>
                    </div>
                )}
            </div>

            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`
              flex-1 p-2 rounded-xl transition-colors duration-200 overflow-y-auto custom-scrollbar
              ${snapshot.isDraggingOver ? 'bg-primary-50/50 dark:bg-primary-900/10 ring-2 ring-primary-100 dark:ring-primary-900/30' : 'bg-gray-100/50 dark:bg-gray-900/30'}
            `}
                        style={{ minHeight: '150px' }}
                    >
                        {demandas.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-60 min-h-[200px]">
                                <Inbox size={32} className="mb-2" />
                                <span className="text-sm font-medium">Vazio</span>
                            </div>
                        ) : (
                            demandas.map((demanda, index) => (
                                <KanbanCard
                                    key={demanda.id}
                                    demanda={demanda}
                                    index={index}
                                    onClick={onCardClick}
                                />
                            ))
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
