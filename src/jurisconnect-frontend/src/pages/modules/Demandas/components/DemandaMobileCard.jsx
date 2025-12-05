import React from 'react';
import { Badge } from '../../../../components/shared/Badge';
import { Calendar, DollarSign, User, Briefcase, ChevronRight } from 'lucide-react';

export function DemandaMobileCard({ demanda, onClick }) {
  const lucro = (demanda.valor_cobrado || 0) - (demanda.valor_custo || 0);
  const isLucroPositivo = lucro >= 0;

  return (
    <div 
      onClick={() => onClick(demanda)}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform mb-3"
    >
      {/* Cabeçalho: Protocolo e Status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">#{demanda.numero}</span>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
            {demanda.tipo_demanda ? demanda.tipo_demanda.charAt(0).toUpperCase() + demanda.tipo_demanda.slice(1) : 'Sem Tipo'}
          </h3>
        </div>
        <Badge type={demanda.status}>{demanda.status.replace('_', ' ').toUpperCase()}</Badge>
      </div>

      {/* Corpo: Cliente e Correspondente */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Briefcase size={14} className="text-gray-400" />
          <span className="truncate max-w-[200px]">{demanda.cliente?.nome_fantasia || 'Sem Cliente'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <User size={14} className="text-gray-400" />
          <span className={`truncate max-w-[200px] ${!demanda.correspondente ? 'text-gray-400 italic' : ''}`}>
            {demanda.correspondente?.nome_fantasia || 'Sem Correspondente'}
          </span>
        </div>
      </div>

      {/* Rodapé: Data e Valores */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={14} />
          <span>
            {demanda.data_agendamento 
              ? new Date(demanda.data_agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
              : '-'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`text-sm font-bold flex items-center ${isLucroPositivo ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
            <span className="text-xs mr-0.5">R$</span>
            {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
}
