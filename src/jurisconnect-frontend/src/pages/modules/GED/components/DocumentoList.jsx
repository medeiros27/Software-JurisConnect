import React from 'react';
import { Card } from '../../../../components/shared/Card';
import { Table } from '../../../../components/shared/Table';
import { Button } from '../../../../components/shared/Button';
import { FileText, Download, Trash2, File } from 'lucide-react';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

export default function DocumentoList({ documentos, loading, onDelete }) {
    const handleDownload = async (doc) => {
        try {
            const response = await api.get(`/documentos/${doc.id}/download`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.nome);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Erro no download:', err);
            toast.error('Erro ao baixar arquivo');
        }
    };

    const columns = [
        {
            key: 'nome',
            label: 'Nome',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(row.created_at).toLocaleDateString()} às {new Date(row.created_at).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: 'tipo',
            label: 'Tipo',
            render: (value) => (
                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {value?.split('/')[1]?.toUpperCase() || 'ARQUIVO'}
                </span>
            )
        },
        {
            key: 'demanda',
            label: 'Demanda Vinculada',
            render: (value) => value ? (
                <span className="text-sm text-gray-600">{value.titulo}</span>
            ) : (
                <span className="text-xs text-gray-400 italic">Geral</span>
            )
        },
        {
            key: 'acoes',
            label: 'Ações',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(row)}
                        title="Baixar"
                    >
                        <Download size={18} className="text-gray-500 hover:text-primary-600" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(row.id)}
                        title="Excluir"
                    >
                        <Trash2 size={18} className="text-gray-500 hover:text-error-600" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <File size={20} />
                    Arquivos Recentes
                </h3>
                <span className="text-sm text-gray-500">
                    {documentos.length} arquivos encontrados
                </span>
            </div>
            <Table
                columns={columns}
                data={documentos}
                loading={loading}
                emptyMessage="Nenhum documento encontrado. Faça o upload acima."
            />
        </Card>
    );
}
