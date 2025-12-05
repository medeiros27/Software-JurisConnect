import React, { useState, useEffect } from 'react';
import { Modal } from '../../../../components/shared/Modal';
import { Input } from '../../../../components/shared/Input';
import { Button } from '../../../../components/shared/Button';
import api from '../../../../services/api';
import { useNotification } from '../../../../hooks/useNotification';
import axios from 'axios';

// Helper functions
const formatCPFCNPJ = (value) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
        return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const formatPhone = (value) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '');
    if (v.length > 10) {
        return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

const formatCEP = (value) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export function ClienteModal({ isOpen, onClose, onSuccess, editingId }) {
    const [formData, setFormData] = useState({
        tipo_pessoa: 'fisica',
        nome_fantasia: '',
        razao_social: '',
        cpf_cnpj: '',
        inscricao_estadual: '',
        inscricao_municipal: '',
        responsavel_legal: '',
        email: '',
        email_financeiro: '',
        telefone: '',
        celular: '',
        endereco: '',
        cidade: '',
        estado: '',

        cep: '',
        ativo: true,
    });
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useNotification();

    const estados = [
        { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
        { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
        { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
        { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
        { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
        { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
        { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
        { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
        { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
    ];

    useEffect(() => {
        if (editingId) {
            loadCliente();
        } else {
            setFormData({
                tipo_pessoa: 'fisica',
                nome_fantasia: '',
                razao_social: '',
                cpf_cnpj: '',
                inscricao_estadual: '',
                inscricao_municipal: '',
                responsavel_legal: '',
                email: '',
                email_financeiro: '',
                telefone: '',
                celular: '',
                endereco: '',
                cidade: '',
                estado: '',
                cep: '',
                ativo: true,
            });
        }
    }, [editingId, isOpen]);

    const loadCliente = async () => {
        try {
            const response = await api.get(`/clientes/${editingId}`);
            const cliente = response.data.data;
            setFormData({
                ...cliente,
                cpf_cnpj: formatCPFCNPJ(cliente.cpf_cnpj),
                telefone: formatPhone(cliente.telefone),
                celular: formatPhone(cliente.celular),
                cep: formatCEP(cliente.cep)
            });
        } catch (err) {
            showError('Erro ao carregar dados do cliente');
            onClose();
        }
    };

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                if (!response.data.erro) {
                    setFormData(prev => ({
                        ...prev,
                        endereco: response.data.logradouro,
                        cidade: response.data.localidade,
                        estado: response.data.uf,
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP', error);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Aplicar máscaras ao digitar
        if (name === 'cpf_cnpj') newValue = formatCPFCNPJ(value);
        if (name === 'telefone' || name === 'celular') newValue = formatPhone(value);
        if (name === 'cep') newValue = formatCEP(value);

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Limpar máscaras antes de enviar
        const payload = {
            ...formData,
            cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
            telefone: formData.telefone.replace(/\D/g, ''),
            celular: formData.celular.replace(/\D/g, ''),
            cep: formData.cep.replace(/\D/g, ''),
        };

        try {
            if (editingId) {
                await api.put(`/clientes/${editingId}`, payload);
                success('Cliente atualizado com sucesso');
            } else {
                await api.post('/clientes', payload);
                success('Cliente criado com sucesso');
            }
            onSuccess();
        } catch (err) {
            showError(err.response?.data?.message || 'Erro ao salvar cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? 'Editar Cliente' : 'Novo Cliente'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Pessoa</label>
                        <select
                            name="tipo_pessoa"
                            value={formData.tipo_pessoa}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="fisica">Física</option>
                            <option value="juridica">Jurídica</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            name="ativo"
                            value={formData.ativo}
                            onChange={(e) => handleChange({ target: { name: 'ativo', value: e.target.value === 'true' } })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </div>
                    <Input
                        label="Nome Fantasia *"
                        name="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={handleChange}
                        required
                        placeholder="Nome principal"
                    />
                    <Input
                        label="Razão Social"
                        name="razao_social"
                        value={formData.razao_social}
                        onChange={handleChange}
                        placeholder="Nome oficial"
                    />
                    <Input
                        label="CPF/CNPJ"
                        name="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                    />
                    <Input
                        label="Inscrição Estadual"
                        name="inscricao_estadual"
                        value={formData.inscricao_estadual}
                        onChange={handleChange}
                    />
                    <Input
                        label="Inscrição Municipal"
                        name="inscricao_municipal"
                        value={formData.inscricao_municipal}
                        onChange={handleChange}
                    />
                    <Input
                        label="Responsável Legal"
                        name="responsavel_legal"
                        value={formData.responsavel_legal}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email Financeiro"
                        name="email_financeiro"
                        type="email"
                        value={formData.email_financeiro}
                        onChange={handleChange}
                    />
                    <Input
                        label="Telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 0000-0000"
                    />
                    <Input
                        label="Celular"
                        name="celular"
                        value={formData.celular}
                        onChange={handleChange}
                        placeholder="(00) 90000-0000"
                    />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="CEP"
                            name="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            onBlur={handleCepBlur}
                            placeholder="00000-000"
                        />
                        <Input
                            label="Endereço"
                            name="endereco"
                            value={formData.endereco}
                            onChange={handleChange}
                        />
                        <Input
                            label="Cidade"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleChange}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Selecione...</option>
                                {estados.map(est => (
                                    <option key={est.value} value={est.value}>{est.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
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
