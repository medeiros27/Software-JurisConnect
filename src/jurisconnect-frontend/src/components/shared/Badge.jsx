import React from 'react';

export const Badge = ({ type, children }) => {
    const colors = {
        aberta: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        aguardando_correspondente: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        concluida: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        atrasada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        cancelada: 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[type] || colors.aberta}`}>
            {children}
        </span>
    );
};
