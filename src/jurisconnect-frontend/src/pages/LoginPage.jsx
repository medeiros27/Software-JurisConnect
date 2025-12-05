import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.senha) {
            toast.error('Preencha todos os campos');
            return;
        }

        const success = await login(formData.email, formData.senha);

        if (success) {
            toast.success('Login realizado com sucesso!');
            navigate('/');
        } else {
            const { error } = useAuthStore.getState();
            toast.error(error || 'Falha no login');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            {/* Left Panel - Branding & Value Prop */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-900 dark:bg-primary-50 items-center justify-center transition-colors duration-500">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/90 to-primary-900/90 dark:from-primary-50/90 dark:via-primary-100/90 dark:to-primary-50/90"></div>

                {/* Animated Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 dark:bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-info-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 max-w-xl px-12 text-center">
                    <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
                        <img
                            src="/logotipo.jpg"
                            alt="JurisConnect Logo"
                            className="h-32 w-auto mx-auto rounded-2xl shadow-2xl border-4 border-white/10 backdrop-blur-sm"
                        />
                    </div>

                    <h1 className="text-5xl font-bold font-display text-white mb-6 leading-tight">
                        Juris<span className="text-primary-300 dark:text-primary-500">Connect</span>
                    </h1>

                    <p className="text-xl text-primary-100 dark:text-primary-800 font-light mb-12 leading-relaxed">
                        A plataforma definitiva para escritórios que buscam
                        <span className="font-semibold text-white"> eficiência</span>,
                        <span className="font-semibold text-white"> controle</span> e
                        <span className="font-semibold text-white"> expansão</span>.
                    </p>

                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/20 dark:bg-primary-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Alta Performance</h3>
                            <p className="text-sm text-primary-200 dark:text-primary-700">Automatize rotinas e foque no que importa.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/20 dark:bg-primary-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🛡️</span>
                            </div>
                            <h3 className="text-white font-semibold mb-2">Segurança Total</h3>
                            <p className="text-sm text-primary-200 dark:text-primary-700">Seus dados protegidos com criptografia de ponta.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden mb-8 flex justify-center">
                            <img
                                src="/logotipo.jpg"
                                alt="JurisConnect Logo"
                                className="h-20 w-auto rounded-xl shadow-lg"
                            />
                        </div>
                        <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-tight">
                            Bem-vindo de volta
                        </h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Entre com suas credenciais para acessar o painel.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Email Corporativo
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 sm:text-sm"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Senha
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                                            Esqueceu a senha?
                                        </a>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="senha"
                                        name="senha"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 sm:text-sm"
                                        placeholder="••••••••"
                                        value={formData.senha}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="lembrar"
                                name="lembrar"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                            />
                            <label htmlFor="lembrar" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer select-none">
                                Lembrar-me por 30 dias
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Autenticando...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        Acessar Sistema
                                        <svg className="ml-2 -mr-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Test Credentials - Styled nicely */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1 md:flex md:justify-between">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Credenciais de Acesso (Demo)
                                    </p>
                                    <p className="mt-2 text-sm md:mt-0 md:ml-6">
                                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-blue-800 dark:text-blue-200 font-mono font-semibold">
                                            admin@jurisconnect.com
                                        </code>
                                        <span className="mx-2 text-blue-300">/</span>
                                        <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded text-blue-800 dark:text-blue-200 font-mono font-semibold">
                                            admin123
                                        </code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                < div className="absolute bottom-6 text-center text-xs text-gray-400 dark:text-gray-500" >
                    & copy; {new Date().getFullYear()} JurisConnect.Todos os direitos reservados.
                </div >
            </div >
        </div >
    );
}
