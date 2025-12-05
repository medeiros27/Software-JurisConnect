import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/shared/Card';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function FinanceiroDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ano, setAno] = useState(new Date().getFullYear());

    useEffect(() => {
        loadDashboardData();
    }, [ano]);

    const loadDashboardData = async () => {
        try {
            const response = await api.get(`/financeiro/dashboard?ano=${ano}`);
            setData(response.data.data);
        } catch (err) {
            console.error('Erro ao carregar dashboard financeiro:', err);
            toast.error('Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const { performance, cashFlow, balanco, totals } = data;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Year Selector */}
            <div className="flex justify-end">
                <select
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                    className="form-select rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>
            </div>

            {/* KPI Cards (Performance Totals) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard
                    title="Total Faturado"
                    value={totals.performance.faturado}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    icon="📊"
                    subtitle="Performance do negócio"
                />
                <SummaryCard
                    title="Lucro Líquido"
                    value={totals.performance.lucro}
                    color="text-green-600"
                    bgColor="bg-green-50"
                    icon="💰"
                    subtitle="Margem de lucro"
                />
                <SummaryCard
                    title="Custo Total"
                    value={totals.performance.custo}
                    color="text-red-600"
                    bgColor="bg-red-50"
                    icon="💸"
                    subtitle="Despesas totais"
                />
            </div>

            {/* Performance Chart (Demandas) */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                    📈 Performance do Negócio
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Baseado em Demandas agendadas (Regime de Competência)
                </p>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={performance}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="mes" tickFormatter={(val) => val.slice(0, 3)} />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="faturado" name="Faturado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="custo" name="Custo" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="lucro" name="Lucro" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Cash Flow Chart (Pagamentos) */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                    💵 Fluxo de Caixa
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Baseado em pagamentos efetivados (Regime de Caixa)
                </p>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={cashFlow}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="mes" tickFormatter={(val) => val.slice(0, 3)} />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="recebido" name="Recebido" stroke="#10B981" strokeWidth={2} />
                            <Line type="monotone" dataKey="pago" name="Pago" stroke="#EF4444" strokeWidth={2} />
                            <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#3B82F6" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Balance Table */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">📋 Balanço Anual - {ano}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Baseado em vencimentos (a receber e a pagar)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mês</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-blue-50/50 dark:bg-blue-900/10">Faturado</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-green-50/50 dark:bg-green-900/10">Lucro</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-red-50/50 dark:bg-red-900/10">Custo</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receberá</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pagará</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recebido</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pago</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {balanco.map((row) => (
                                <tr key={row.mes} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.mes}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/5">{formatCurrency(row.faturado)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-900/5">{formatCurrency(row.lucro)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-900/5">{formatCurrency(row.custo)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{formatCurrency(row.recebera)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{formatCurrency(row.pagara)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{formatCurrency(row.recebido)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{formatCurrency(row.pago)}</td>
                                </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-100 dark:bg-gray-900 font-bold">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">TOTAL</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-700 dark:text-blue-300">{formatCurrency(totals.balanco.faturado)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-700 dark:text-green-300">{formatCurrency(totals.balanco.lucro)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-700 dark:text-red-300">{formatCurrency(totals.balanco.custo)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(totals.balanco.recebera)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(totals.balanco.pagara)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(totals.balanco.recebido)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(totals.balanco.pago)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function SummaryCard({ title, value, color, bgColor, icon, subtitle }) {
    return (
        <div className={`p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm ${bgColor}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <h4 className={`text-2xl font-bold ${color}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    </h4>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="text-2xl">{icon}</div>
            </div>
        </div>
    );
}
