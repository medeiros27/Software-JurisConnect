import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/shared/Button';
import PagamentosKanban from './components/PagamentosKanban';
import TransacaoModal from './components/TransacaoModal';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { LayoutGrid, List, Search, Filter, Plus, Calendar, ArrowUpDown } from 'lucide-react';
import TransacoesList from './components/TransacoesList';
import ReciboModal from './components/ReciboModal';

export default function Pagamentos() {
    const [transacoes, setTransacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showReciboModal, setShowReciboModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [reciboData, setReciboData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('receitas'); // 'receitas' | 'despesas'
    const [viewMode, setViewMode] = useState('list');

    // Filters & Pagination State
    const [filters, setFilters] = useState({
        data_inicio: '',
        data_fim: '',
        status: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 1
    });

    const [dashboardData, setDashboardData] = useState(null);
    const [sortBy, setSortBy] = useState('data_agendamento'); // Keep state but remove UI control

    const loadDashboard = useCallback(async () => {
        try {
            const response = await api.get('/financeiro/dashboard', {
                params: { ano: new Date().getFullYear() }
            });
            setDashboardData(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard, refreshKey]);

    const loadTransacoes = useCallback(async () => {
        setLoading(true);
        try {
            const isKanban = viewMode === 'kanban';
            const params = {
                page: isKanban ? 1 : pagination.page,
                limit: isKanban ? 1000 : pagination.limit,
                tipo: activeTab === 'receitas' ? 'receber' : 'pagar',
                sortBy,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await api.get('/financeiro/pagamentos', { params });

            if (response.data.meta) {
                setTransacoes(response.data.data || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.meta.total,
                    pages: response.data.meta.pages,
                    totalValue: response.data.meta.totalValue || 0
                }));
            } else {
                setTransacoes(response.data.data || []);
            }
        } catch (err) {
            console.error('Erro ao carregar transações:', err);
            toast.error('Erro ao carregar transações');
            setTransacoes([]); // Safety fallback
        } finally {
            setLoading(false);
        }
    }, [refreshKey, activeTab, pagination.page, pagination.limit, filters, viewMode, sortBy]);

    useEffect(() => {
        loadTransacoes();
    }, [loadTransacoes]);

    // Reset page when tab or filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [activeTab, filters, sortBy]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/financeiro/pagamentos/${id}/status`, { status: newStatus });
            toast.success('Status atualizado com sucesso');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            toast.error('Erro ao atualizar status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este pagamento?')) return;
        try {
            await api.delete(`/financeiro/pagamentos/${id}`);
            toast.success('Pagamento excluído com sucesso');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error('Erro ao excluir pagamento:', err);
            toast.error('Erro ao excluir pagamento');
        }
    };

    return (
        <div className="min-h-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50 -m-6 p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Financeiro</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Visão geral do fluxo de caixa e pagamentos
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                            title="Lista"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                            title="Kanban"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                    <Button onClick={() => {
                        setEditingItem(null);
                        setShowModal(true);
                    }} className="flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all">
                        <Plus size={20} />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {/* Summary Cards */}
            {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas (Ano)</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {dashboardData?.totals?.cashFlow?.recebido?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas (Ano)</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {dashboardData?.totals?.cashFlow?.pago?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo (Ano)</p>
                        <p className={`text-2xl font-bold mt-1 ${(dashboardData?.totals?.cashFlow?.saldo || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {dashboardData?.totals?.cashFlow?.saldo?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendente (Geral)</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {((dashboardData?.totals?.balanco?.recebera || 0) - (dashboardData?.totals?.balanco?.pagara || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs & Filters Container */}
            <div className="flex flex-col space-y-4">
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('receitas')}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-md transition-all
                            ${activeTab === 'receitas'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
                        `}
                    >
                        Receitas (Clientes)
                    </button>
                    <button
                        onClick={() => setActiveTab('despesas')}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-md transition-all
                            ${activeTab === 'despesas'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
                        `}
                    >
                        Despesas (Correspondentes)
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative w-full lg:max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            className="block w-full rounded-lg border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
                            placeholder="Buscar por fatura, cliente, correspondente..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-1 gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-1.5 px-3 w-full sm:w-auto">
                            <Calendar size={16} className="text-gray-400" />
                            <input
                                type="date"
                                name="data_inicio"
                                value={filters.data_inicio}
                                onChange={handleFilterChange}
                                className="border-0 bg-transparent p-0 text-sm focus:ring-0 dark:text-white w-full sm:w-auto"
                            />
                            <span className="text-gray-400 text-sm">até</span>
                            <input
                                type="date"
                                name="data_fim"
                                value={filters.data_fim}
                                onChange={handleFilterChange}
                                className="border-0 bg-transparent p-0 text-sm focus:ring-0 dark:text-white w-full sm:w-auto"
                            />
                        </div>

                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="block w-full sm:w-40 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="">Status: Todos</option>
                            <option value="pendente">Pendente</option>
                            <option value="pago">Pago</option>
                            <option value="atrasado">Atrasado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 flex flex-col">
                {viewMode === 'kanban' ? (
                    <PagamentosKanban
                        transacoes={transacoes}
                        onStatusChange={handleStatusChange}
                        onEdit={(item) => {
                            setEditingItem(item);
                            setShowModal(true);
                        }}
                    />
                ) : (
                    <div className="flex-1 flex flex-col">
                        <TransacoesList
                            transacoes={transacoes}
                            loading={loading}
                            activeTab={activeTab}
                            onEdit={(item) => {
                                setEditingItem(item);
                                setShowModal(true);
                            }}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            onGenerateRecibo={(item) => {
                                setReciboData(item);
                                setShowReciboModal(true);
                            }}
                            onBulkStatusChange={async (ids, status) => {
                                try {
                                    await api.post('/financeiro/pagamentos/bulk/update', { ids, status });
                                    toast.success(`${ids.length} pagamentos atualizados!`);
                                    setRefreshKey(prev => prev + 1);
                                } catch (err) {
                                    console.error('Erro ao atualizar em lote:', err);
                                    toast.error('Erro ao atualizar pagamentos');
                                }
                            }}
                            sortBy={sortBy}
                        />

                        {/* Pagination Controls */}
                        {!loading && transacoes.length > 0 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={pagination.page === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                                        disabled={pagination.page === pagination.pages}
                                    >
                                        Próximo
                                    </Button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Mostrando <span className="font-medium">{((Number(pagination.page) - 1) * Number(pagination.limit)) + 1}</span> a <span className="font-medium">{Math.min(Number(pagination.page) * Number(pagination.limit), Number(pagination.total) || 0)}</span> de <span className="font-medium">{Number(pagination.total) || 0}</span> resultados
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={pagination.limit}
                                            onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                                            className="rounded-md border-gray-300 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="20">20 por página</option>
                                            <option value="50">50 por página</option>
                                            <option value="100">100 por página</option>
                                        </select>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                                disabled={Number(pagination.page) === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(Number(pagination.pages), prev.page + 1) }))}
                                                disabled={Number(pagination.page) >= Number(pagination.pages)}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                Próximo
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <TransacaoModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false);
                    setRefreshKey(prev => prev + 1);
                }}
                initialData={editingItem}
            />

            <ReciboModal
                isOpen={showReciboModal}
                onClose={() => setShowReciboModal(false)}
                initialData={reciboData}
            />
        </div>
    );
}
