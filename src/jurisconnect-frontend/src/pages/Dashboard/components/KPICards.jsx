import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

export function KPICards({ kpis }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const cards = [
        {
            title: 'Receita Estimada',
            value: formatCurrency(kpis?.receita_prevista),
            icon: <DollarSign className="w-6 h-6 text-blue-400" />,
            color: 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
            bg: 'bg-blue-500/10',
            desc: 'Baseado em demandas ativas'
        },
        {
            title: 'Lucro Estimado',
            value: formatCurrency(kpis?.lucro_previsto),
            icon: <TrendingUp className="w-6 h-6 text-green-400" />,
            color: 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
            bg: 'bg-green-500/10',
            desc: 'Receita - Custos (Previsto)'
        },
        {
            title: 'Custo Previsto',
            value: formatCurrency(kpis?.custo_previsto),
            icon: <TrendingDown className="w-6 h-6 text-orange-400" />,
            color: 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
            bg: 'bg-orange-500/10',
            desc: 'Custos Operacionais'
        },
        {
            title: 'Margem (Prevista)',
            value: `${kpis?.receita_prevista > 0 ? ((kpis.lucro_previsto / kpis.receita_prevista) * 100).toFixed(1) : 0}%`,
            icon: <PieChart className="w-6 h-6 text-purple-400" />,
            color: 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
            bg: 'bg-purple-500/10',
            desc: 'Eficiência Projetada'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`relative overflow-hidden rounded-xl border p-6 backdrop-blur-md transition-all hover:scale-[1.02] ${card.color} bg-[var(--color-bg-surface)] border-[var(--color-border)]`}
                >
                    <div className={`absolute top-0 right-0 p-3 rounded-bl-xl ${card.bg}`}>
                        {card.icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
