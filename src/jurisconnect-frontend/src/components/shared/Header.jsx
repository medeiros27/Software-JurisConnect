import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-4">
                <img
                    src="/logotipo.jpg?v=2"
                    alt="JurisConnect Logo"
                    className="h-10 w-auto object-contain"
                />
                <h2 className="text-2xl font-bold font-primary text-gray-900 dark:text-gray-100">
                    <span className="text-primary-500 dark:text-primary-400">Juris</span>Connect
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-300">
                    <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.nome || 'Usuário'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Visitante'}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title="Sair"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
