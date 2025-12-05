import React from 'react';

export function DashboardHeader({ periodo, setPeriodo }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                    COMMAND CENTER
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                    JURISCONNECT SYSTEM v2.0
                </p>
            </div>
            <div className="flex rounded-lg p-1 border bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-sm">
                {['hoje', '7dias', 'mes', 'ano'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriodo(p)}
                        className={`px-4 py-2 rounded-md text-xs font-mono font-medium transition-all ${periodo === p
                            ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 shadow-sm dark:shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:border dark:border-primary-500/30'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {p === 'hoje' ? 'HOJE' : p === '7dias' ? '7 DIAS' : p === 'mes' ? 'MÊS' : 'ANO'}
                    </button>
                ))}
            </div>
        </div>
    );
}
