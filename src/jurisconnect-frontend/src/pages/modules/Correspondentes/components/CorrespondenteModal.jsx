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

export function CorrespondenteModal({ isOpen, onClose, onSuccess, editingId }) {
    const [formData, setFormData] = useState({
        tipo: 'advogado',
        nome_fantasia: '',
        email: '',
        telefone: '',
        celular: '',
        cpf_cnpj: '',
        estado_sediado: '',
        cidade_sediado: '',
        endereco_completo: '',
        cep: '',
        oab_numero: '',
        oab_estado: '',

        cidades_atendidas: '',
        ativo: true,
    });
    const [cityInput, setCityInput] = useState('');
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
            loadCorrespondente();
        } else {
            setFormData({
                tipo: 'advogado',
                nome_fantasia: '',
                email: '',
                telefone: '',
                celular: '',
                cpf_cnpj: '',
                estado_sediado: '',
                cidade_sediado: '',
                endereco_completo: '',
                cep: '',
                oab_numero: '',
                oab_estado: '',

                cidades_atendidas: '',
                ativo: true,
            });
            setCityInput('');
        }
    }, [editingId, isOpen]);

    const loadCorrespondente = async () => {
        try {
            const response = await api.get(`/correspondentes/${editingId}`);
            const data = response.data.data;
            setFormData({
                ...data,
                cpf_cnpj: formatCPFCNPJ(data.cpf_cnpj),
                telefone: formatPhone(data.telefone),
                celular: formatPhone(data.celular),
                cep: formatCEP(data.cep),
                cidades_atendidas: data.cidades_atendidas || ''
            });
        } catch (err) {
            showError('Erro ao carregar dados');
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
                        endereco_completo: response.data.logradouro,
                        cidade_sediado: response.data.localidade,
                        estado_sediado: response.data.uf,
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

        if (name === 'cpf_cnpj') newValue = formatCPFCNPJ(value);
        if (name === 'telefone' || name === 'celular') newValue = formatPhone(value);
        if (name === 'cep') newValue = formatCEP(value);

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleAddCity = (e) => {
        e.preventDefault();
        if (!cityInput.trim()) return;

        const currentCities = formData.cidades_atendidas ? formData.cidades_atendidas.split(',').map(c => c.trim()).filter(Boolean) : [];
        // Evitar duplicatas
        if (!currentCities.some(c => c.toLowerCase() === cityInput.trim().toLowerCase())) {
            const newCities = [...currentCities, cityInput.trim()];
            setFormData(prev => ({ ...prev, cidades_atendidas: newCities.join(', ') }));
        }
        setCityInput('');
    };

    const handleRemoveCity = (cityToRemove) => {
        const currentCities = formData.cidades_atendidas.split(',').map(c => c.trim());
        const newCities = currentCities.filter(c => c !== cityToRemove);
        setFormData(prev => ({ ...prev, cidades_atendidas: newCities.join(', ') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
            telefone: formData.telefone.replace(/\D/g, ''),
            celular: formData.celular.replace(/\D/g, ''),
            cep: formData.cep.replace(/\D/g, ''),
        };

        try {
            if (editingId) {
                await api.put(`/correspondentes/${editingId}`, payload);
                success('Correspondente atualizado com sucesso');
            } else {
                await api.post('/correspondentes', payload);
                success('Correspondente criado com sucesso');
            }
            onSuccess();
        } catch (err) {
            showError(err.response?.data?.error?.message || 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const citiesList = formData.cidades_atendidas ? formData.cidades_atendidas.split(',').map(c => c.trim()).filter(Boolean) : [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingId ? 'Editar Correspondente' : 'Novo Correspondente'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo Selection */}
                <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tipo"
                            value="advogado"
                            checked={formData.tipo === 'advogado'}
                            onChange={handleChange}
                            className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Advogado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="tipo"
                            value="preposto"
                            checked={formData.tipo === 'preposto'}
                            onChange={handleChange}
                            className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Preposto</span>
                    </label>

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

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nome Completo *"
                        name="nome_fantasia"
                        value={formData.nome_fantasia}
                        onChange={handleChange}
                        required
                        placeholder="Nome do correspondente"
                    />
                    <Input
                        label="CPF/CNPJ"
                        name="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                    />
                    <Input
                        label="Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@exemplo.com"
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

                {/* OAB Fields (conditional) */}
                {formData.tipo === 'advogado' && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <Input
                            label="Número OAB"
                            name="oab_numero"
                            value={formData.oab_numero}
                            onChange={handleChange}
                            placeholder="000000"
                        />
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado OAB</label>
                            <select
                                name="oab_estado"
                                value={formData.oab_estado}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mt-1 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Selecione...</option>
                                {estados.map(est => (
                                    <option key={est.value} value={est.value}>{est.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Address */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Localização</h4>
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
                            name="endereco_completo"
                            value={formData.endereco_completo}
                            onChange={handleChange}
                        />
                        <Input
                            label="Cidade"
                            name="cidade_sediado"
                            value={formData.cidade_sediado}
                            onChange={handleChange}
                        />
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                            <select
                                name="estado_sediado"
                                value={formData.estado_sediado}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mt-1 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Selecione...</option>
                                {estados.map(est => (
                                    <option key={est.value} value={est.value}>{est.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cidades Atendidas */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Cidades Atendidas</h4>
                    <div className="flex gap-2 mb-2">
                        <Input
                            placeholder="Digite o nome da cidade e pressione Enter ou Adicionar"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault(); // Prevent form submit
                                    handleAddCity(e);
                                }
                            }}
                            className="flex-1"
                        />
                        <Button type="button" onClick={handleAddCity} variant="secondary">Adicionar</Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md min-h-[50px]">
                        {citiesList.length === 0 && (
                            <span className="text-gray-400 text-sm italic">Nenhuma cidade adicionada</span>
                        )}
                        {citiesList.map((city, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                {city}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCity(city)}
                                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 hover:text-blue-500 focus:outline-none"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Adicione as cidades onde este correspondente atua.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Criar')}
                    </Button>
                </div>
            </form>
        </Modal >
    );
}
