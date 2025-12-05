import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { PagamentoKanbanCard } from './PagamentoKanbanCard';
import { isPast, isToday } from 'date-fns';

export default function PagamentosKanban({ transacoes, onStatusChange, onEdit }) {

    // Helper to categorize transactions
    const categorize = (items) => {
        const columns = {
            atrasado: [],
            pendente: [],
            pago: []
        };

        items.forEach(item => {
            if (item.status === 'pago') {
                columns.pago.push(item);
            } else {
                if (!item.data_vencimento) {
                    columns.pendente.push(item);
                    return;
                }
                const vencimento = new Date(item.data_vencimento);
                // Check if date is valid
                if (isNaN(vencimento.getTime())) {
                    columns.pendente.push(item);
                    return;
                }

                if (isPast(vencimento) && !isToday(vencimento)) {
                    columns.atrasado.push(item);
                } else {
                    columns.pendente.push(item);
                }
            }
        });

        return columns;
    };

    const columns = categorize(transacoes);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatusMap = {
            'pago': 'pago',
            'pendente': 'pendente',
            'atrasado': 'pendente' // Moving to atrasado is just pendente but overdue, handled by date usually, but here we might just set status to pendente and let logic handle it, or if user drags to 'pago', we set 'pago'.
        };

        // If dragging TO 'pago', set status 'pago'.
        // If dragging FROM 'pago' TO 'pendente' or 'atrasado', set status 'pendente'.

        let newStatus = 'pendente';
        if (destination.droppableId === 'pago') {
            newStatus = 'pago';
        } else {
            newStatus = 'pendente';
        }

        // Call parent handler
        onStatusChange(draggableId, newStatus);
    };

    const Column = ({ title, id, items, color }) => (
        <div className="flex flex-col h-full min-w-[300px] bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${color}`}>
                <h3 className="font-bold text-gray-700 dark:text-gray-200">{title}</h3>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
                    {items.length}
                </span>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto min-h-[200px] transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`}
                    >
                        {items.map((item, index) => (
                            <PagamentoKanbanCard
                                key={item.id}
                                pagamento={item}
                                index={index}
                                onClick={onEdit}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)] overflow-x-auto pb-4">
                <Column
                    title="Atrasado"
                    id="atrasado"
                    items={columns.atrasado}
                    color="border-red-500"
                />
                <Column
                    title="A Vencer / Pendente"
                    id="pendente"
                    items={columns.pendente}
                    color="border-yellow-500"
                />
                <Column
                    title="Pago"
                    id="pago"
                    items={columns.pago}
                    color="border-green-500"
                />
            </div>
        </DragDropContext>
    );
}
