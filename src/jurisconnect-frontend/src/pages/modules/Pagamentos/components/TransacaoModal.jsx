import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import { Input } from '../../../../components/shared/Input';
import { Button } from '../../../../components/shared/Button';
import { SearchableSelect } from '../../../../components/shared/SearchableSelect';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

export default function TransacaoModal({ isOpen, onClose, onSuccess, initialData }) {
    const [formData, setFormData] = useState({
        numero_fatura: '',
        tipo: 'receber',
        valor: '',
        data_vencimento: '',
        status: 'pendente',
        observacoes: '',
        demanda_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [correspondentes, setCorrespondentes] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadDemandas();
            loadCorrespondentes();
        }
    }, [isOpen]);

    const loadDemandas = async () => {
        try {
            const response = await api.get('/demandas', { params: { limit: 1000 } });
            setDemandas(response.data.data.demandas || []);
        } catch (error) {
            console.error('Erro ao carregar demandas:', error);
        }
    };

    const loadCorrespondentes = async () => {
        try {
            const response = await api.get('/correspondentes', { params: { limit: 1000 } });
            setCorrespondentes(response.data.data.correspondentes || []);
        } catch (error) {
            console.error('Erro ao carregar correspondentes:', error);
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                numero_fatura: initialData.numero_fatura || '',
                tipo: initialData.tipo || 'receber',
                valor: initialData.valor || '',
                data_vencimento: initialData.data_vencimento ? initialData.data_vencimento.split('T')[0] : '',
                status: initialData.status || 'pendente',
                observacoes: initialData.observacoes || '',
                demanda_id: initialData.demanda_id || '',
                correspondente_id: initialData.correspondente_id || ''
            });
        } else {
            setFormData({
                numero_fatura: '',
                tipo: 'receber',
                valor: '',
                data_vencimento: '',
                status: 'pendente',
                observacoes: '',
                demanda_id: '',
                correspondente_id: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                valor: parseFloat(formData.valor),
                demanda_id: formData.demanda_id ? parseInt(formData.demanda_id) : null,
                correspondente_id: formData.correspondente_id ? parseInt(formData.correspondente_id) : null
            };

            if (initialData && initialData.id) {
                await api.put(`/financeiro/pagamentos/${initialData.id}`, payload);
                toast.success('Transação atualizada com sucesso!');
            } else {
                await api.post('/financeiro/pagamentos', payload);
                toast.success('Transação criada com sucesso!');
            }
            onSuccess();
        } catch (err) {
            console.error('Erro ao salvar transação:', err);
            toast.error('Erro ao salvar transação');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Editar Transação' : 'Nova Transação'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-4">
                    <SearchableSelect
                        label="Vincular à Demanda (Opcional)"
                        placeholder="Selecione uma demanda..."
                        options={(demandas || []).map(d => ({ value: d.id, label: `${d.numero} - ${d.titulo || d.tipo_demanda}` }))}
                        value={formData.demanda_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, demanda_id: val }))}
                    />

                    <SearchableSelect
                        label="Correspondente / Beneficiário (Opcional)"
                        placeholder="Selecione um correspondente..."
                        options={(correspondentes || []).map(c => ({ value: c.id, label: c.nome_fantasia || c.nome || 'Sem Nome' }))}
                        value={formData.correspondente_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, correspondente_id: val }))}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo *</label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="receber">Receita</option>
                            <option value="pagar">Despesa</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="vencido">Vencido</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>

                <Input
                    label="Número da Fatura/Doc *"
                    name="numero_fatura"
                    value={formData.numero_fatura}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Valor (R$) *"
                        name="valor"
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Data de Vencimento *"
                        name="data_vencimento"
                        type="date"
                        value={formData.data_vencimento}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Observações</label>
                    <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    ></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
