import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function AgendaWidget({ agendamentos }) {
    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm font-mono uppercase tracking-wider text-gray-900 dark:text-gray-400">
                    📅 Próximos Eventos
                </h3>
                <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 dark:border dark:border-primary-500/30">
                    NEXT 5
                </span>
            </div>

            <div className="relative">
                {/* Linha do tempo vertical */}
                <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-[var(--color-border)]"></div>

                {agendamentos?.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">Nenhum agendamento próximo.</p>
                ) : (
                    <div className="space-y-6">
                        {agendamentos?.map((item, index) => {
                            const data = new Date(item.data);
                            return (
                                <div key={item.id} className="flex gap-4 items-start relative group">
                                    {/* Bolinha da timeline */}
                                    <div className={`absolute left-[15px] top-[6px] w-2.5 h-2.5 rounded-full border-2 z-10 ${index === 0
                                        ? 'bg-primary-500 border-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                        : 'bg-[var(--color-bg-surface)] border-[var(--color-border)]'
                                        }`}></div>

                                    <div className="flex flex-col items-center min-w-[3rem] pl-8">
                                        <span className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">
                                            {data.toLocaleDateString('pt-BR', { month: 'short' })}
                                        </span>
                                        <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                                            {data.getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 pb-4 border-b group-last:border-0 group-last:pb-0 border-gray-50 dark:border-gray-700">
                                        <p className="font-medium text-gray-900 dark:text-gray-200">{item.titulo}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs font-mono text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {item.cliente && (
                                                <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                    <MapPin className="w-3 h-3" />
                                                    {item.cliente}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
