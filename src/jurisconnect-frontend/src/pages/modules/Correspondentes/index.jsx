import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../../components/shared/Card';
import { Button } from '../../../components/shared/Button';
import { Table } from '../../../components/shared/Table';
import { Modal } from '../../../components/shared/Modal';
import { Input } from '../../../components/shared/Input';
import { Pagination } from '../../../components/shared/Pagination';
import { StatCard } from '../../../components/shared/StatCard';
import api from '../../../services/api';
import { useNotification } from '../../../hooks/useNotification';

import { CorrespondenteModal } from './components/CorrespondenteModal';

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

export default function CorrespondentesList() {
  const [correspondentes, setCorrespondentes] = useState([]);
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
    tipo: '',
    estado_sediado: '',
    ativo: '',
  });
  const { success, error: showError } = useNotification();

  useEffect(() => {
    loadData();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [correspResp, statsResp] = await Promise.all([
        api.get('/correspondentes', {
          params: {
            busca: filters.search,
            ...filters,
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
          },
        }),
        api.get('/correspondentes/estatisticas'),
      ]);

      const responseData = correspResp.data.data;
      setCorrespondentes(responseData.correspondentes || []);
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

  const handleToggleAtivo = async (id, currentStatus) => {
    try {
      await api.patch(`/correspondentes/${id}/toggle-ativo`);
      success(`Correspondente ${currentStatus ? 'desativado' : 'ativado'} com sucesso`);
      loadData();
    } catch (err) {
      showError('Erro ao alterar status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este correspondente?')) return;

    try {
      await api.delete(`/correspondentes/${id}`);
      success('Correspondente deletado com sucesso');
      loadData();
    } catch (err) {
      showError(err.response?.data?.error?.message || 'Erro ao deletar correspondente');
    }
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
    {
      key: 'nome_fantasia',
      label: 'Nome',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.email}</div>
        </div>
      )
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${value === 'advogado' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
          }`}>
          {value?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'demandas_count',
      label: 'Demandas',
      render: (value) => (
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {value || 0}
        </span>
      )
    },
    {
      key: 'cidade_sediado',
      label: 'Cidade/UF',
      render: (value, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value || '-'} {row.estado_sediado ? `/ ${row.estado_sediado}` : ''}
        </span>
      )
    },
    {
      key: 'telefone',
      label: 'Contato',
      render: (value, row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>{formatPhone(value)}</div>
          {row.celular && <div>{formatPhone(row.celular)}</div>}
        </div>
      )
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
          }`}>
          {value ? 'ATIVO' : 'INATIVO'}
        </span>
      )
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex gap-1">
          <button
            onClick={() => {
              setEditingId(row.id);
              setShowModal(true);
            }}
            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => handleToggleAtivo(row.id, row.ativo)}
            className={`p-1 rounded transition-colors ${row.ativo ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
            title={row.ativo ? 'Desativar' : 'Ativar'}
          >
            {row.ativo ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total" value={statistics.total} icon="👥" color="blue" />
          <StatCard title="Ativos" value={statistics.ativos} icon="✓" color="green" />
          <StatCard title="Advogados" value={statistics.advogados} icon="⚖️" color="purple" />
          <StatCard title="Demandas Abertas" value={statistics.demandas_abertas} icon="📋" color="orange" />
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="🔍 Buscar por nome, email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
          >
            <option value="">Todos os tipos</option>
            <option value="advogado">Advogado</option>
            <option value="preposto">Preposto</option>
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
          <Button
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
          >
            ➕ Novo Correspondente
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={correspondentes}
          loading={loading}
        />

        {/* Pagination */}
        {!loading && correspondentes.length > 0 && (
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

      {/* Modal */}
      <CorrespondenteModal
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


