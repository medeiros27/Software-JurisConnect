import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../../components/shared/Card';
import { Button } from '../../../components/shared/Button';
import { Table } from '../../../components/shared/Table';
import { Input } from '../../../components/shared/Input';
import { Modal } from '../../../components/shared/Modal';
import { Pagination } from '../../../components/shared/Pagination';
import { StatCard } from '../../../components/shared/StatCard';
import api from '../../../services/api';
import { useNotification } from '../../../hooks/useNotification';

import { ClienteModal } from './components/ClienteModal';

// Funções auxiliares de formatação
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

export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    tipo_pessoa: '',
    ativo: 'true',
  });
  const { success, error: showError } = useNotification();

  useEffect(() => {
    loadData();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientesResp, statsResp] = await Promise.all([
        api.get('/clientes', {
          params: {
            busca: filters.search,
            ...filters,
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
          },
        }),
        api.get('/clientes/estatisticas'),
      ]);

      const responseData = clientesResp.data.data;
      setClientes(responseData.clientes || []);
      setPagination(prev => ({
        ...prev,
        totalItems: responseData.pagination.total,
        totalPages: responseData.pagination.pages,
      }));
      setStatistics(statsResp.data.data);
    } catch (err) {
      showError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${item.nome_fantasia}"?`)) {
      try {
        await api.delete(`/clientes/${item.id}`);
        success('Cliente excluído com sucesso');
        loadData();
      } catch (err) {
        showError('Erro ao excluir cliente. Verifique se não há demandas vinculadas.');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setShowModal(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1,
    }));
  };

  const columns = [
    { key: 'nome_fantasia', label: 'Nome do Escritório' },
    {
      key: 'cpf_cnpj',
      label: 'CPF/CNPJ',
      render: (value) => formatCPFCNPJ(value)
    },
    { key: 'email', label: 'Email' },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (value) => formatPhone(value)
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
          {value ? 'ATIVO' : 'INATIVO'}
        </span>
      )
    },
    {
      key: 'demandas_abertas',
      label: 'Demandas',
      render: (value) => (
        <span className={`font-bold px-2 py-1 rounded-full text-xs ${value > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
          {value || 0} Abertas
        </span>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total" value={statistics.total} icon="👥" color="blue" />
          <StatCard title="Ativos" value={statistics.ativos} icon="✓" color="green" />
          <StatCard title="Pessoa Física" value={statistics.pessoa_fisica} icon="👤" color="purple" />
          <StatCard title="Pessoa Jurídica" value={statistics.pessoa_juridica} icon="🏢" color="orange" />
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader
          title="Clientes"
          subtitle="Gerenciamento de escritórios e empresas"
          action={
            <Button onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}>➕ Novo Cliente</Button>
          }
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="🔍 Buscar por nome, CNPJ, email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={filters.tipo_pessoa}
            onChange={(e) => setFilters({ ...filters, tipo_pessoa: e.target.value })}
          >
            <option value="">Todos os tipos</option>
            <option value="fisica">Pessoa Física</option>
            <option value="juridica">Pessoa Jurídica</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={filters.ativo}
            onChange={(e) => setFilters({ ...filters, ativo: e.target.value })}
          >
            <option value="">Todos os status</option>
            <option value="true">Apenas Ativos</option>
            <option value="false">Apenas Inativos</option>
          </select>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={clientes}
          loading={loading}
        />

        {/* Pagination */}
        {!loading && clientes.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </Card>

      {/* Modal de Criar/Editar */}
      <ClienteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          loadData();
          setShowModal(false);
        }}
        editingId={editingId}
      />
    </div>
  );
}


