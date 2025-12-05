import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, FileText, Calendar, CreditCard, Menu, X, Users, Briefcase, Settings
} from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const mainItems = [
        { label: 'Início', icon: Home, path: '/' },
        { label: 'Demandas', icon: FileText, path: '/demandas' },
        { label: 'Agenda', icon: Calendar, path: '/agenda' },
        { label: 'Finan.', icon: CreditCard, path: '/pagamentos' },
    ];

    const moreItems = [
        { label: 'Correspondentes', icon: Users, path: '/correspondentes' },
        { label: 'Clientes', icon: Briefcase, path: '/clientes' },
        { label: 'Configurações', icon: Settings, path: '/configuracoes' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Menu "Mais" (Overlay) */}
            {showMoreMenu && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowMoreMenu(false)}>
                    <div
                        className="absolute bottom-16 right-4 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-2 space-y-1">
                            {moreItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMoreMenu(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Barra Inferior Fixa */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {mainItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowMoreMenu(false)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}

                    {/* Botão Mais */}
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${showMoreMenu ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {showMoreMenu ? <X size={24} /> : <Menu size={24} />}
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
