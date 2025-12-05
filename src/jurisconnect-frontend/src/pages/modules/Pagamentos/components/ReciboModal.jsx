import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '../../../../components/shared/Button';
import { X } from 'lucide-react';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

export default function ReciboModal({ isOpen, onClose, initialData }) {
    const [formData, setFormData] = useState({
        pagador: '',
        cpf_cnpj: '',
        valor: '',
        data_pagamento: '',
        referente_a: '',
        observacoes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                pagador: initialData.demanda?.cliente?.nome_fantasia || '',
                cpf_cnpj: initialData.demanda?.cliente?.cpf_cnpj || '',
                valor: initialData.valor || '',
                data_pagamento: initialData.data_pagamento ? new Date(initialData.data_pagamento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                referente_a: initialData.demanda ? `Demanda #${initialData.demanda.numero} - ${initialData.demanda.titulo}` : '',
                observacoes: initialData.observacoes || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/financeiro/pagamentos/recibo', formData, {
                responseType: 'blob' // Important for PDF download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `recibo-${formData.pagador}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Recibo gerado com sucesso!');
            onClose();
        } catch (error) {
            console.error('Erro ao gerar recibo:', error);
            toast.error('Erro ao gerar recibo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                            Gerar Recibo
                        </DialogTitle>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pagador (Cliente)</label>
                            <input
                                type="text"
                                name="pagador"
                                value={formData.pagador}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF/CNPJ</label>
                            <input
                                type="text"
                                name="cpf_cnpj"
                                value={formData.cpf_cnpj}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="valor"
                                    value={formData.valor}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data Pagamento</label>
                                <input
                                    type="date"
                                    name="data_pagamento"
                                    value={formData.data_pagamento}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Referente a</label>
                            <textarea
                                name="referente_a"
                                value={formData.referente_a}
                                onChange={handleChange}
                                rows={2}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações (Opcional)</label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                rows={2}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" isLoading={loading}>
                                Gerar PDF
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
