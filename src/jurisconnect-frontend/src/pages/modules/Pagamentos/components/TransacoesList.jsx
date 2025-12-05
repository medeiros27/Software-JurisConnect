import React, { useMemo } from 'react';
import { Card } from '../../../../components/shared/Card';
import { Table } from '../../../../components/shared/Table';
import { Button } from '../../../../components/shared/Button';
import { format, parseISO, isPast, isToday, startOfMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    AlertCircle, CheckCircle, Clock,
    FileText, User, Briefcase, Trash2, Edit2, FileCheck
} from 'lucide-react';

export default function TransacoesList({
    transacoes = [],
    loading,
    onEdit,
    onDelete,
    activeTab,
    onStatusChange,
    onGenerateRecibo,
    onBulkStatusChange
}) {
    const [selectedIds, setSelectedIds] = React.useState([]);

    // Reset selection when tab changes or data reloads
    React.useEffect(() => {
        setSelectedIds([]);
    }, [activeTab, transacoes]);

    // Ensure transacoes is always an array
    const safeTransacoes = Array.isArray(transacoes) ? transacoes : [];

    // 1. Calculate Summaries
    const summaries = useMemo(() => {
        let pending = 0;
        let pendingCount = 0;
        let overdue = 0;
        let overdueCount = 0;
        let paid = 0;
        let paidCount = 0;

        safeTransacoes.forEach(t => {
            const val = Number(t.valor) || 0;
            if (t.status === 'pago') {
                paid += val;
                paidCount++;
            } else {
                const dateStr = t.demanda?.data_agendamento || t.data_vencimento;
                const dueDate = dateStr ? parseISO(dateStr) : null;

                if (dueDate && isValid(dueDate) && isPast(dueDate) && !isToday(dueDate)) {
                    overdue += val;
                    overdueCount++;
                } else {
                    pending += val;
                    pendingCount++;
                }
            }
        });

        return { pending, pendingCount, overdue, overdueCount, paid, paidCount };
    }, [safeTransacoes]);

    // 2. Group by Month
    const groupedTransactions = useMemo(() => {
        const groups = {};

        safeTransacoes.forEach(t => {
            const dateStr = t.demanda?.data_agendamento || t.data_vencimento;
            let date = dateStr ? parseISO(dateStr) : new Date();

            if (!isValid(date)) {
                date = new Date();
            }

            const monthKey = format(startOfMonth(date), 'yyyy-MM');
            const monthLabel = format(date, 'MMMM yyyy', { locale: ptBR });

            if (!groups[monthKey]) {
                groups[monthKey] = {
                    label: monthLabel,
                    items: [],
                    total: 0
                };
            }
            groups[monthKey].items.push(t);
            groups[monthKey].total += Number(t.valor);
        });

        return Object.entries(groups)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => ({ key, ...value }));
    }, [safeTransacoes]);

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const columns = [
        {
            key: 'entidade',
            label: activeTab === 'receitas' ? 'Cliente / Demanda' : 'Correspondente / Demanda',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeTab === 'receitas'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                        {activeTab === 'receitas' ? <Briefcase size={18} /> : <User size={18} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={activeTab === 'receitas' ? row.demanda?.cliente?.nome_fantasia : row.correspondente?.nome_fantasia}>
                            {activeTab === 'receitas'
                                ? row.demanda?.cliente?.nome_fantasia || 'Cliente N/A'
                                : row.correspondente?.nome_fantasia || 'Correspondente N/A'}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${row.demanda
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                {row.demanda ? `#${row.demanda.numero}` : 'Avulso'}
                            </span>
                            {row.numero_fatura && (
                                <span className="text-xs text-gray-400 truncate max-w-[100px]" title={row.numero_fatura}>
                                    Ref: {row.numero_fatura}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'data_vencimento',
            label: 'Vencimento',
            render: (_, row) => {
                const dateStr = row.demanda?.data_agendamento || row.data_vencimento;
                const date = dateStr ? parseISO(dateStr) : null;
                const isOverdue = date && isPast(date) && !isToday(date) && row.status !== 'pago';

                return (
                    <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {date ? format(date, 'dd MMM yyyy', { locale: ptBR }) : '-'}
                        </span>
                        {isOverdue && (
                            <span className="text-xs text-red-500 font-medium mt-0.5">Atrasado</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'valor',
            label: 'Valor',
            render: (val, row) => (
                <span className={`font-bold ${row.tipo === 'receber'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    {formatCurrency(val)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(row.id, row.status === 'pago' ? 'pendente' : 'pago');
                    }}
                    className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all
                        ${row.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'}
                    `}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'pago' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {row.status === 'pago' ? 'Pago' : 'Pendente'}
                </button>
            )
        },
        {
            key: 'acoes',
            label: 'Ações',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-1">
                    {row.status === 'pago' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                row.tipo === 'pagar'
                                    ? window.open(`http://localhost:3001/api/v1/financeiro/pagamentos/${row.id}/recibo`, '_blank')
                                    : onGenerateRecibo(row);
                            }}
                            title="Gerar Recibo"
                        >
                            <FileCheck size={16} />
                        </Button>
                    )}
                    {row.source !== 'demanda' ? (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(row);
                                }}
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-full text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(row.id);
                                }}
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400 italic px-2">Via Demanda</span>
                    )}
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">Carregando financeiro...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4 flex items-center justify-between shadow-sm sticky top-4 z-20 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-100 dark:bg-primary-800 p-2 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-primary-900 dark:text-primary-100 font-medium">
                            {selectedIds.length} item(s) selecionado(s)
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <select
                            className="px-4 py-2 rounded-lg border-0 ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onChange={(e) => {
                                if (e.target.value) {
                                    onBulkStatusChange(selectedIds, e.target.value);
                                    setSelectedIds([]);
                                    e.target.value = '';
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Alterar Status para...</option>
                            <option value="pendente">Marcar como Pendente</option>
                            <option value="pago">Marcar como Pago</option>
                            <option value="cancelado">Marcar como Cancelado</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atrasados</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaries.overdue)}</h3>
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                {summaries.overdueCount} pagamentos vencidos
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">A Vencer</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaries.pending)}</h3>
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                {summaries.pendingCount} pagamentos pendentes
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Realizados</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaries.paid)}</h3>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                {summaries.paidCount} pagamentos concluídos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-8">
                {groupedTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Nenhuma transação encontrada</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                            Não encontramos pagamentos com os filtros selecionados. Tente ajustar a busca ou o período.
                        </p>
                    </div>
                ) : (
                    groupedTransactions.map(group => (
                        <div key={group.key} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                                    {group.label}
                                </h3>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                    Total: {formatCurrency(group.total)}
                                </span>
                            </div>

                            <Card className="overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                                <Table
                                    columns={columns}
                                    data={group.items}
                                    selectable={true}
                                    selectedIds={selectedIds}
                                    onSelectionChange={setSelectedIds}
                                    onRowClick={onEdit}
                                />
                            </Card>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
