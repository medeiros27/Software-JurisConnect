import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api, { getErrorMessage } from '../services/api';
import { toast } from 'react-hot-toast';
import { DashboardHeader } from './Dashboard/components/DashboardHeader';
import { KPICards } from './Dashboard/components/KPICards';
import { AgendaWidget } from './Dashboard/components/AgendaWidget';
import { FinancialChart } from './Dashboard/components/FinancialChart';
import { ActivityFeed } from './Dashboard/components/ActivityFeed';
import { CriticalAlerts } from './Dashboard/components/CriticalAlerts';
import { UrgentDemandsWidget } from './Dashboard/components/UrgentDemandsWidget';

export default function Dashboard() {
  const { theme } = useTheme();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    loadDashboardData();
  }, [periodo]);

  const loadDashboardData = async () => {
    try {
      // setLoading(true); // Opcional: não mostrar loading full screen ao trocar filtro para melhor UX
      const response = await api.get(`/dashboard?periodo=${periodo}`);
      setKpis(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <p className="text-gray-500 dark:text-gray-400 font-mono animate-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      <DashboardHeader periodo={periodo} setPeriodo={setPeriodo} theme={theme} />

      {/* Urgent Actions Widget (Next 48h) */}
      <UrgentDemandsWidget />

      {/* Critical Ops Widget */}
      <CriticalAlerts
        alerts={kpis?.prazos_criticos_lista || []}
        count={kpis?.prazos_criticos_count || 0}
      />

      {/* Financial Intelligence */}
      <KPICards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico Financeiro */}
          <div className="h-[400px] bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] p-4 shadow-lg transition-colors duration-300">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">Performance Financeira</h3>
            <FinancialChart data={kpis?.historico_financeiro || []} periodo={periodo} theme={theme} />
          </div>

          {/* Agenda */}
          <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] p-4 shadow-lg transition-colors duration-300">
            <AgendaWidget agendamentos={kpis?.agendamentos_proximos || []} theme={theme} />
          </div>
        </div>

        {/* Coluna Lateral (1/3) */}
        <div className="space-y-6">
          {/* Feed de Atividades */}
          <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] p-4 shadow-lg h-full transition-colors duration-300">
            <ActivityFeed atividades={kpis?.demandas_recentes || []} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
