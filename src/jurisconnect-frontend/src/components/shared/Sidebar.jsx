import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, BarChart3, Users, Briefcase, FileText,
  Calendar, CheckSquare, CreditCard, Settings
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/' },
    { label: 'Correspondentes', icon: Users, path: '/correspondentes' },
    { label: 'Clientes', icon: Briefcase, path: '/clientes' },
    { label: 'Demandas', icon: FileText, path: '/demandas' },
    { label: 'Agenda', icon: Calendar, path: '/agenda' },
    { label: 'Pagamentos', icon: CreditCard, path: '/pagamentos' },
    { label: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  return (
    <aside className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 transition-all duration-300 border-r border-gray-200 dark:border-gray-700 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen && (
          <h1 className="font-bold font-primary text-lg">
            <span className="text-primary-500 dark:text-primary-400">Juris</span>
            <span className="text-gray-900 dark:text-gray-100">Connect</span>
          </h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          {isOpen ? <X size={20} className="text-gray-400" /> : <Menu size={20} className="text-gray-400" />}
        </button>
      </div>

      <nav className="mt-4">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${location.pathname === item.path
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon size={20} className={location.pathname === item.path ? 'text-white' : ''} />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
