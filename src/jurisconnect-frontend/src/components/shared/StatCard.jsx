import React from 'react';

export function StatCard({ title, value, icon, color }) {
    const colorStyles = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/30',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/30',
    };

    return (
        <div className={`p-4 rounded-lg border ${colorStyles[color] || colorStyles.blue}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value || 0}</p>
                </div>
                <div className="text-3xl opacity-50">{icon}</div>
            </div>
        </div>
    );
}
