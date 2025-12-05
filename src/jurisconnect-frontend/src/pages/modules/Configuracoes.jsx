import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Mail, Calendar, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';
import BackupTab from './Configuracoes/BackupTab';

export default function Configuracoes() {
    const [activeTab, setActiveTab] = useState('perfil');
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'perfil', label: 'Perfil', icon: User },
        { id: 'notificacoes', label: 'Notificações', icon: Bell },
        { id: 'seguranca', label: 'Segurança', icon: Shield },
        { id: 'integracao', label: 'Integrações', icon: Database },
        { id: 'email', label: 'E-mail', icon: Mail },
        { id: 'calendario', label: 'Calendário', icon: Calendar },
        { id: 'backup', label: 'Backup', icon: HardDrive },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            toast.error('Erro ao salvar configurações');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gerencie as configurações do sistema
                    </p>
                </div>
                <Settings className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab.id
                                        ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {activeTab === 'perfil' && <PerfilTab />}
                {activeTab === 'notificacoes' && <NotificacoesTab />}
                {activeTab === 'seguranca' && <SegurancaTab />}
                {activeTab === 'integracao' && <IntegracaoTab />}
                {activeTab === 'email' && <EmailTab />}
                {activeTab === 'calendario' && <CalendarioTab />}
                {activeTab === 'backup' && <BackupTab />}

                {/* Save Button - Don't show for backup tab */}
                {activeTab !== 'backup' && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function PerfilTab() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações do Perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome Completo
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Seu nome"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        E-mail
                    </label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="seu@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Telefone
                    </label>
                    <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="(00) 00000-0000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cargo
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Seu cargo"
                    />
                </div>
            </div>
        </div>
    );
}

function NotificacoesTab() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
            <div className="space-y-3">
                {[
                    { label: 'Notificações por e-mail', description: 'Receber notificações importantes por e-mail' },
                    { label: 'Notificações push', description: 'Receber notificações no navegador' },
                    { label: 'Notificações de demandas', description: 'Ser notificado sobre novas demandas' },
                    { label: 'Notificações de pagamentos', description: 'Ser notificado sobre pagamentos' },
                ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 text-primary-600" defaultChecked />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SegurancaTab() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Segurança da Conta</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Senha Atual
                    </label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nova Senha
                    </label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmar Nova Senha
                    </label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>
            </div>
        </div>
    );
}

function IntegracaoTab() {
    const [expanded, setExpanded] = useState(null);
    const [testing, setTesting] = useState(null);
    const [results, setResults] = useState({});
    const [configs, setConfigs] = useState({
        whatsapp: { phoneId: '', token: '', to: '' },
        googleCalendar: {},
        s3: { region: 'us-east-1', accessKeyId: '', secretAccessKey: '', bucket: '' },
    });

    const integrations = [
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            icon: 'MessageCircle',
            fields: [
                { name: 'phoneId', label: 'Phone Number ID', type: 'text' },
                { name: 'token', label: 'Access Token', type: 'password' },
                { name: 'to', label: 'Número para Teste (ex: 5511999999999)', type: 'text' }
            ]
        },
        {
            id: 'googleCalendar',
            name: 'Google Calendar',
            icon: 'Calendar',
            fields: [] // OAuth flow usually
        },
        {
            id: 'receita',
            name: 'Receita Federal (CNPJ)',
            icon: 'FileText',
            fields: [] // No auth needed for basic
        },
        {
            id: 'viacep',
            name: 'ViaCEP',
            icon: 'MapPin',
            fields: [] // No auth needed
        },
        {
            id: 's3',
            name: 'AWS S3',
            icon: 'HardDrive',
            fields: [
                { name: 'region', label: 'Região (ex: us-east-1)', type: 'text' },
                { name: 'accessKeyId', label: 'Access Key ID', type: 'text' },
                { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
                { name: 'bucket', label: 'Bucket Name', type: 'text' }
            ]
        },
    ];

    const handleTest = async (id) => {
        setTesting(id);
        setResults(prev => ({ ...prev, [id]: null }));

        try {
            const token = localStorage.getItem('token');
            const config = configs[id] || {};

            let url = '';
            let method = 'POST';
            let body = null;

            switch (id) {
                case 'whatsapp':
                    url = apiConfig.integrations.whatsapp;
                    body = JSON.stringify(config);
                    break;
                case 'googleCalendar':
                    url = apiConfig.integrations.googleCalendar;
                    break;
                case 's3':
                    url = apiConfig.integrations.s3;
                    body = JSON.stringify(config);
                    break;
                case 'viacep':
                    url = apiConfig.integrations.viacep;
                    method = 'GET';
                    break;
                case 'receita':
                    url = apiConfig.integrations.receita;
                    method = 'GET';
                    break;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error?.message || data.message || 'Erro na requisição');

            setResults(prev => ({
                ...prev,
                [id]: { success: true, message: data.message, details: data }
            }));

            if (data.success) {
                toast.success(`Teste de ${id} realizado com sucesso!`);
            } else {
                throw new Error(data.message);
            }

        } catch (error) {
            setResults(prev => ({
                ...prev,
                [id]: { success: false, message: error.message }
            }));
            toast.error(`Erro no teste de ${id}: ${error.message}`);
        } finally {
            setTesting(null);
        }
    };

    const handleChange = (id, field, value) => {
        setConfigs(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Integrações Externas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure e teste as conexões com serviços externos.
            </p>

            <div className="space-y-4">
                {integrations.map((integration) => (
                    <div key={integration.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => setExpanded(expanded === integration.id ? null : integration.id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${results[integration.id]?.success ? 'bg-green-500' : results[integration.id]?.success === false ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-500'}`} />
                                <span className="font-medium text-gray-900 dark:text-white">{integration.name}</span>
                            </div>
                            <button className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                                {expanded === integration.id ? 'Fechar' : 'Configurar'}
                            </button>
                        </div>

                        {expanded === integration.id && (
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                {integration.fields.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {integration.fields.map((field) => (
                                            <div key={field.name}>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {field.label}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    value={configs[integration.id]?.[field.name] || ''}
                                                    onChange={(e) => handleChange(integration.id, field.name, e.target.value)}
                                                    placeholder={field.type === 'password' ? '••••••••' : ''}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        Esta integração não requer configuração de credenciais ou usa OAuth.
                                        Clique em testar para verificar a conexão.
                                    </p>
                                )}

                                {/* Feedback Area */}
                                {results[integration.id] && (
                                    <div className={`p-3 rounded-lg text-sm ${results[integration.id].success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30'}`}>
                                        <div className="flex items-start gap-2">
                                            {results[integration.id].success ? (
                                                <div className="mt-0.5">✅</div>
                                            ) : (
                                                <div className="mt-0.5">❌</div>
                                            )}
                                            <div>
                                                <p className="font-medium">{results[integration.id].success ? 'Sucesso' : 'Erro'}</p>
                                                <p>{results[integration.id].message}</p>
                                                {results[integration.id].details?.authUrl && (
                                                    <a
                                                        href={results[integration.id].details.authUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block mt-2 text-primary-600 hover:underline font-medium"
                                                    >
                                                        Clique aqui para autorizar no Google
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTest(integration.id);
                                        }}
                                        disabled={testing === integration.id}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors
                                            ${testing === integration.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}
                                        `}
                                    >
                                        {testing === integration.id ? (
                                            <>
                                                <span className="animate-spin">⌛</span>
                                                Testando...
                                            </>
                                        ) : (
                                            <>
                                                ⚡ Testar Conexão
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmailTab() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de E-mail</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Provedor de E-mail
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>SendGrid</option>
                        <option>AWS SES</option>
                        <option>SMTP Personalizado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        E-mail de Envio
                    </label>
                    <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="noreply@jurisconnect.com"
                    />
                </div>
            </div>
        </div>
    );
}

function CalendarioTab() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configurações de Calendário</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fuso Horário
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>America/Sao_Paulo (GMT-3)</option>
                        <option>America/Manaus (GMT-4)</option>
                        <option>America/Fortaleza (GMT-3)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Horário de Trabalho
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            defaultValue="08:00"
                        />
                        <input
                            type="time"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            defaultValue="18:00"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
