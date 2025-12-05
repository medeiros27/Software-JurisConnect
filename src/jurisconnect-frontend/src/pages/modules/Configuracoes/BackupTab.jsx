import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, RefreshCw, Clock, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';

const BackupTab = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        loadBackups();
        loadConfig();
    }, []);

    const loadBackups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/backup/list');
            setBackups(response.data.data || []);
        } catch (error) {
            console.error('Error loading backups:', error);
            toast.error('Erro ao carregar lista de backups');
        } finally {
            setLoading(false);
        }
    };

    const loadConfig = async () => {
        try {
            const response = await api.get('/backup/config');
            setConfig(response.data.data);
        } catch (error) {
            console.error('Error loading config:', error);
        }
    };

    const createBackup = async () => {
        try {
            setCreating(true);
            toast.loading('Criando backup...', { id: 'backup' });

            const response = await api.post('/backup/create');

            if (response.data.success) {
                toast.success('Backup criado com sucesso!', { id: 'backup' });
                await loadBackups();
            } else {
                toast.error(response.data.message || 'Erro ao criar backup', { id: 'backup' });
            }
        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error(error.response?.data?.message || 'Erro ao criar backup', { id: 'backup' });
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (filename) => {
        try {
            toast.loading('Preparando download...', { id: 'download' });

            const response = await api.get(`/backup/download/${filename}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Download iniciado!', { id: 'download' });
        } catch (error) {
            console.error('Error downloading backup:', error);
            toast.error('Erro ao fazer download', { id: 'download' });
        }
    };

    const deleteBackup = async (filename) => {
        if (!confirm(`Tem certeza que deseja deletar o backup ${filename}?`)) {
            return;
        }

        try {
            const response = await api.delete(`/backup/${filename}`);

            if (response.data.success) {
                toast.success('Backup deletado com sucesso!');
                await loadBackups();
            }
        } catch (error) {
            console.error('Error deleting backup:', error);
            toast.error('Erro ao deletar backup');
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Informações e Criação de Backup */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            Backup do Banco de Dados
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Crie e gerencie backups do seu banco de dados
                        </p>
                    </div>
                    <button
                        onClick={createBackup}
                        disabled={creating}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} />
                        {creating ? 'Criando...' : 'Criar Backup Agora'}
                    </button>
                </div>

                {config && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-blue-900">Backup Automático Ativo</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Backups automáticos são criados todos os dias às 03:00 AM
                                </p>
                                <p className="text-sm text-blue-700">
                                    Retenção: últimos {config.retention_count} backups
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de Backups */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-gray-600" />
                        Backups Disponíveis ({backups.length})
                    </h3>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-gray-600">Carregando backups...</p>
                        </div>
                    ) : backups.length === 0 ? (
                        <div className="text-center py-8">
                            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">Nenhum backup disponível</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Clique em "Criar Backup Agora" para criar seu primeiro backup
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {backups.map((backup) => (
                                <div
                                    key={backup.filename}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded">
                                            <Database className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{backup.filename}</p>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(backup.created)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <HardDrive className="w-4 h-4" />
                                                    {formatBytes(backup.size)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => downloadBackup(backup.filename)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteBackup(backup.filename)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Deletar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Informações Importantes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-amber-900">Importante</h3>
                        <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                            <li>Faça backups regulares para proteger seus dados</li>
                            <li>Armazene backups em local seguro, preferencialmente fora do servidor</li>
                            <li>Backups antigos são automaticamente removidos após {config?.retention_count || 7} dias</li>
                            <li>O backup inclui todo o banco de dados e arquivos enviados</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupTab;
