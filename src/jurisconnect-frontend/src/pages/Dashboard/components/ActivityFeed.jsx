import React from 'react';
import { Terminal } from 'lucide-react';

export function ActivityFeed({ atividades, theme }) {
    const isDark = theme === 'dark';

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Terminal className={`w-4 h-4 ${isDark ? 'text-green-500' : 'text-gray-900'}`} />
                <h3 className={`font-bold text-sm font-mono uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-900'}`}>
                    System Logs
                </h3>
            </div>

            <div className="flex-1 overflow-auto rounded-lg p-4 font-mono text-xs bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                {atividades?.length === 0 ? (
                    <p className={`text-center py-6 ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>No system activity detected.</p>
                ) : (
                    <div className="space-y-3">
                        {atividades?.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start group">
                                <span className="text-gray-600 select-none">{'>'}</span>
                                <div>
                                    <p className={`${isDark ? 'text-green-400' : 'text-gray-900'}`}>
                                        <span className={isDark ? 'text-white' : 'text-gray-900'}>UPDATE_DEMANDA:</span> {item.titulo}
                                    </p>
                                    <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>
                                        ID: #{item.numero} | STATUS: <span className={`uppercase ${item.status === 'concluida' ? 'text-green-500' :
                                            item.status === 'pendente' ? 'text-yellow-500' : 'text-blue-500'
                                            }`}>{item.status}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="animate-pulse text-green-500 mt-4">_</div>
                    </div>
                )}
            </div>
        </div>
    );
}
