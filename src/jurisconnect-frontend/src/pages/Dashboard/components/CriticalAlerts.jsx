import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CriticalAlerts({ alerts, count }) {
    if (!count || count === 0) return null;

    return (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-xl p-4 mb-6 animate-pulse-slow backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                    <AlertTriangle className="w-6 h-6 animate-bounce" />
                    <h3 className="text-lg font-bold tracking-wider uppercase">Critical Ops: {count} Prazos Urgentes</h3>
                </div>
                <Link to="/demandas?filter=urgente" className="text-xs font-mono text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1">
                    VER TODOS <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.map(alert => (
                    <div key={alert.id} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-3 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <div className="overflow-hidden">
                            <p className="text-red-700 dark:text-red-200 font-medium truncate text-sm">{alert.titulo || `Demanda #${alert.numero}`}</p>
                            <p className="text-red-500 dark:text-red-400/70 text-xs truncate">{alert.cliente?.nome_fantasia}</p>
                        </div>
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-mono whitespace-nowrap ml-2">
                            <Clock className="w-3 h-3" />
                            <span>
                                {new Date(alert.data_prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
