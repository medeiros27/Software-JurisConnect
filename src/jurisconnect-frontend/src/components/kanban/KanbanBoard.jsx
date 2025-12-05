import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';

export const KanbanBoard = ({ demandas, onDragEnd, onCardClick }) => {
    const columns = {
        rascunho: 'Rascunho',
        pendente: 'Pendente',
        em_andamento: 'Em Andamento',
        aguardando_correspondente: 'Aguardando',
        concluida: 'Concluída',
        cancelada: 'Cancelada'
    };

    // Group demandas by status
    const getDemandasByStatus = (status) => {
        return demandas.filter(d => d.status === status);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)] items-start">
                {Object.entries(columns).map(([status, title]) => (
                    <KanbanColumn
                        key={status}
                        columnId={status}
                        title={title}
                        demandas={getDemandasByStatus(status)}
                        onCardClick={onCardClick}
                    />
                ))}
            </div>
        </DragDropContext>
    );
};
