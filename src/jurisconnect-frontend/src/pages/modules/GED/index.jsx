import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/shared/Card';
import DocumentoUpload from './components/DocumentoUpload';
import DocumentoList from './components/DocumentoList';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function GED() {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadDocumentos();
    }, [refreshKey]);

    const loadDocumentos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/documentos');
            setDocumentos(response.data.data || []);
        } catch (err) {
            console.error('Erro ao carregar documentos:', err);
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este arquivo permanentemente?')) return;

        try {
            await api.delete(`/documentos/${id}`);
            toast.success('Arquivo removido com sucesso');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Erro ao deletar:', err);
            toast.error('Erro ao deletar arquivo');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Gestão Eletrônica de Documentos (GED)</h1>
                    <p className="text-gray-500 dark:text-gray-400">Centralize e organize todos os arquivos do escritório</p>
                </div>
            </div>

            {/* Área de Upload */}
            <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Upload de Arquivos</h3>
                <DocumentoUpload onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </Card>

            {/* Lista de Arquivos */}
            <DocumentoList
                documentos={documentos}
                loading={loading}
                onDelete={handleDelete}
            />
        </div>
    );
}
