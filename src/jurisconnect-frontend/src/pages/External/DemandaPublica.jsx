import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, CheckCircle, AlertTriangle, Clock, MapPin, DollarSign, Download } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function DemandaPublica() {
    const { token } = useParams();
    const [demanda, setDemanda] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchDemanda = useCallback(async () => {
        try {
            const response = await api.get(`/publico/demanda/${token}`);
            setDemanda(response.data.data);
        } catch (error) {
            console.error('Erro ao buscar demanda:', error);
            toast.error('Erro ao carregar demanda. Verifique o link.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDemanda();
    }, [fetchDemanda]);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/publico/demanda/${token}/arquivos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Arquivo enviado com sucesso!');
            fetchDemanda(); // Reload to show new file
        } catch (error) {
            console.error('Erro no upload:', error);
            toast.error('Erro ao enviar arquivo.');
        } finally {
            setUploading(false);
        }
    }, [token, fetchDemanda]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 10 * 1024 * 1024, // 10MB
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!demanda) {
        return (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Demanda não encontrada</h2>
                <p className="text-gray-600 dark:text-gray-400">O link pode estar incorreto ou expirado.</p>
            </div>
        );
    }

    if (demanda.is_finalized) {
        return (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Demanda Finalizada</h2>
                <p className="text-gray-600 dark:text-gray-400">{demanda.message}</p>
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg inline-block">
                    <p className="font-mono text-sm text-gray-500">Protocolo: {demanda.numero}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-2">
                            {demanda.tipo_demanda}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{demanda.titulo}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">#{demanda.numero}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1 justify-end">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                                {new Date(demanda.data_agendamento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm justify-end">
                            <MapPin className="w-4 h-4" />
                            <span>{demanda.cidade}/{demanda.estado}</span>
                        </div>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Instruções</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{demanda.descricao || 'Sem descrição adicional.'}</p>
                </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary-600" />
                    Enviar Comprovantes / Peças
                </h2>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                        }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
                            <p className="text-gray-600 dark:text-gray-300">Enviando arquivo...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full inline-block mb-4">
                                <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                                Arraste arquivos aqui ou clique para selecionar
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                PDF, Word ou Imagens (Max 10MB)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Files List - Split by Origin */}
            {demanda.documentos && demanda.documentos.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Arquivos da Diligência (Office) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Arquivos da Diligência
                        </h2>
                        <div className="space-y-3">
                            {demanda.documentos.filter(d => d.criado_por !== null).length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">Nenhum arquivo enviado pelo escritório.</p>
                            ) : (
                                demanda.documentos.filter(d => d.criado_por !== null).map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-700">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{doc.nome}</p>
                                                <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={(() => {
                                                if (!doc.url) return '#';
                                                if (doc.url.startsWith('http')) return doc.url;
                                                const baseUrl = api.defaults.baseURL?.split('/api')[0] || '';
                                                if (doc.url.startsWith('/uploads')) return `${baseUrl}${doc.url}`;
                                                const filename = doc.url.split(/[/\\]/).pop();
                                                return `${baseUrl}/uploads/${filename}`;
                                            })()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                            title="Baixar Arquivo"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Seus Envios (Correspondent) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Seus Envios
                        </h2>
                        <div className="space-y-3">
                            {demanda.documentos.filter(d => d.criado_por === null).length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">Você ainda não enviou nenhum arquivo.</p>
                            ) : (
                                demanda.documentos.filter(d => d.criado_por === null).map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-700">
                                                <FileText className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{doc.nome}</p>
                                                <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            Recebido
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
