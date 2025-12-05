import React from 'react';

export function StatusIndicator({ status, prazo, dataPrazo }) {
    const now = new Date();
    const deadline = dataPrazo ? new Date(dataPrazo) : null;

    // Calcula dias até o prazo
    let daysDiff = null;
    if (deadline && status !== 'concluida' && status !== 'cancelada') {
        daysDiff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    }

    const getIndicatorConfig = () => {
        // Se já concluída ou cancelada, não mostra indicador
        if (status === 'concluida' || status === 'cancelada') {
            return null;
        }

        // Atrasada
        if (daysDiff < 0) {
            return {
                color: 'bg-red-500',
                icon: '⚠️',
                text: 'Atrasada',
                pulse: true,
            };
        }

        // Vence hoje
        if (daysDiff === 0) {
            return {
                color: 'bg-orange-500',
                icon: '🔔',
                text: 'Vence hoje',
                pulse: true,
            };
        }

        // Vence amanhã
        if (daysDiff === 1) {
            return {
                color: 'bg-yellow-500',
                icon: '⏰',
                text: 'Vence amanhã',
                pulse: false,
            };
        }

        // Vence em 2-3 dias
        if (daysDiff <= 3) {
            return {
                color: 'bg-yellow-400',
                icon: '📅',
                text: `${daysDiff} dias`,
                pulse: false,
            };
        }

        // Mais de 3 dias
        return null;
    };

    const config = getIndicatorConfig();

    if (!config) return null;

    return (
        <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
                {config.pulse && (
                    <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}
                    />
                )}
                <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`}
                />
            </span>
            <span className="text-xs font-medium text-gray-600">
                {config.icon} {config.text}
            </span>
        </div>
    );
}

export function PriorityBadge({ prioridade }) {
    const configs = {
        urgente: {
            color: 'bg-red-100 text-red-800 border-red-300',
            icon: '🔥',
        },
        alta: {
            color: 'bg-orange-100 text-orange-800 border-orange-300',
            icon: '⬆️',
        },
        media: {
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            icon: '➡️',
        },
        baixa: {
            color: 'bg-green-100 text-green-800 border-green-300',
            icon: '⬇️',
        },
    };

    const config = configs[prioridade] || configs.media;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
        >
            {config.icon}
            <span className="capitalize">{prioridade}</span>
        </span>
    );
}
