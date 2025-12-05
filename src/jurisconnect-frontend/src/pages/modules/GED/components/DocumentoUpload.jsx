import React, { useState, useRef } from 'react';
import { Button } from '../../../../components/shared/Button';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { Upload, File, X } from 'lucide-react';

export default function DocumentoUpload({ onSuccess }) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        // formData.append('demanda_id', demandaId); // Opcional: se estiver dentro de uma demanda

        try {
            await api.post('/documentos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Arquivo enviado com sucesso!');
            setFile(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Erro no upload:', err);
            toast.error('Erro ao enviar arquivo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`
          relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-colors
          ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />

                {!file ? (
                    <div className="flex flex-col items-center text-center p-4">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 font-medium">
                            Arraste e solte seu arquivo aqui ou
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-primary-600 hover:text-primary-700"
                            onClick={() => inputRef.current?.click()}
                        >
                            Selecione um arquivo
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">
                            PDF, DOCX, JPG, PNG (Max. 10MB)
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-4 w-full max-w-xs">
                        <div className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3">
                            <File className="w-8 h-8 text-primary-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-error-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full"
                        >
                            {uploading ? 'Enviando...' : 'Confirmar Upload'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
