import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/shared/Card';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function AgendaAlerts() {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlertas();
    }, []);

    const loadAlertas = async () => {
        try {
            const response = await api.get('/agenda/alertas');
            const { demandas, agenda } = response.data.data;

            // Unificar e formatar alertas
            const alertasDemandas = (demandas || []).map(d => ({
                id: `demanda_${d.id}`,
                titulo: d.titulo,
                data: d.data_prazo,
                tipo: 'prazo',
                subtitulo: d.cliente?.nome_fantasia
            }));

            const alertasAgenda = (agenda || []).map(a => ({
                id: `agenda_${a.id}`,
                titulo: a.titulo,
                data: a.data_evento,
                tipo: a.tipo,
                subtitulo: a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)
            }));

            const todosAlertas = [...alertasDemandas, ...alertasAgenda].sort((a, b) => new Date(a.data) - new Date(b.data));

            setAlertas(todosAlertas);
        } catch (err) {
            console.error('Erro ao carregar alertas:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
        </div>
    );

    if (alertas.length === 0) {
        return (
            <Card className="p-4 bg-success-50 dark:bg-green-900/20 border-success-100 dark:border-green-900/30">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <h4 className="font-bold text-success-700 dark:text-green-400">Tudo em dia!</h4>
                        <p className="text-sm text-success-600 dark:text-green-500">Nenhum prazo ou compromisso para os próximos 7 dias.</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4 bg-warning-50 dark:bg-yellow-900/20 border-warning-100 dark:border-yellow-900/30">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-warning-800 dark:text-yellow-400">Próximos 7 Dias</h3>
            </div>
            <div className="space-y-3">
                {alertas.map(alerta => (
                    <div key={alerta.id} className="bg-white dark:bg-gray-800 p-3 rounded border border-warning-200 dark:border-yellow-900/30 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-1" title={alerta.titulo}>
                                {alerta.tipo === 'prazo' ? '⚖️ ' : '📅 '}
                                {alerta.titulo}
                            </h4>
                            <span className="text-xs font-bold text-error-600 dark:text-red-400 whitespace-nowrap ml-2">
                                {new Date(alerta.data).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alerta.subtitulo}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
