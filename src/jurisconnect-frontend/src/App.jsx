import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import DesignSystem from './pages/DesignSystem';

// Modules
import Correspondentes from './pages/modules/Correspondentes';
import Clientes from './pages/modules/Clientes';
import Demandas from './pages/modules/Demandas';
import Agenda from './pages/modules/Agenda';
import Pagamentos from './pages/modules/Pagamentos';
import Configuracoes from './pages/modules/Configuracoes';

// Components
import Layout from './components/shared/Layout';
import ExternalLayout from './layouts/ExternalLayout';
import DemandaPublica from './pages/External/DemandaPublica';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
    const { initAuth } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, []);

    return (
        <ThemeProvider>
            <Toaster
                position="top-right"
                containerStyle={{
                    zIndex: 100000,
                }}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/design-system" element={<DesignSystem />} />

                {/* External Routes */}
                <Route path="/externo" element={<ExternalLayout />}>
                    <Route path="demanda/:token" element={<DemandaPublica />} />
                </Route>

                {/* Protected Routes with Layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="correspondentes" element={<Correspondentes />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="demandas" element={<Demandas />} />
                    <Route path="agenda" element={<Agenda />} />
                    <Route path="pagamentos" element={<Pagamentos />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                </Route>

                {/* 404 Not Found */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </ThemeProvider>
    );
}
