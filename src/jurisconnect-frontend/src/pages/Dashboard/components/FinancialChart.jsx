import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function FinancialChart({ data, periodo, theme }) {
    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                    <XAxis
                        dataKey="mes"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--color-bg-hover)', opacity: 0.3 }}
                        contentStyle={{
                            backgroundColor: 'var(--color-bg-surface)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            color: 'var(--color-text-primary)',
                            padding: '12px'
                        }}
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                        labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }} />
                    <Bar
                        dataKey="receita"
                        name="Faturado"
                        fill="url(#colorReceita)"
                        radius={[6, 6, 0, 0]}
                        barSize={24}
                    />
                    <Bar
                        dataKey="despesa"
                        name="Custo"
                        fill="url(#colorDespesa)"
                        radius={[6, 6, 0, 0]}
                        barSize={24}
                    />
                    <Line
                        type="monotone"
                        dataKey="lucro"
                        name="Lucro"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: 'var(--color-bg-surface)' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
