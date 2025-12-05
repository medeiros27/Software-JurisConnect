import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function ExternalLayout() {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-600 p-2 rounded-lg shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                            JurisConnect
                        </span>
                    </div>
                </div>

                <Outlet />

                <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-600">
                    &copy; {new Date().getFullYear()} JurisConnect. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}
