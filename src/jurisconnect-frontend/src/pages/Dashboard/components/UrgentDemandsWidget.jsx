import React, { useState, useEffect } from 'react';
import { Clock, MessageCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export function UrgentDemandsWidget() {
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUrgentDemands = async () => {
            try {
                // Fetch all active demands (limit 50 to be safe, then filter client-side for 48h)
                // Ideally backend should have a specific endpoint or filter, but we'll use existing list for now
                const response = await api.get('/demandas', {
                    params: {
                        limit: 100,
                        status: 'pendente', // or exclude concluida/cancelada
                        sort: 'data_agendamento',
                        order: 'ASC'
                    }
                });

                const allDemands = response.data.data.demandas || [];
                const now = new Date();
                const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

                const urgent = allDemands.filter(d => {
                    if (!d.data_agendamento) return false;
                    const date = new Date(d.data_agendamento);
                    return date >= now && date <= next48h && d.status !== 'concluida' && d.status !== 'cancelada';
                });

                setDemands(urgent.slice(0, 5)); // Show top 5
            } catch (error) {
                console.error('Erro ao buscar demandas urgentes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUrgentDemands();
    }, []);

    const handleWhatsAppClick = (e, row) => {
        e.preventDefault();
        e.stopPropagation();

        const phone = row.correspondente?.celular || row.correspondente?.telefone;

        if (!phone) {
            toast.error('Correspondente sem telefone cadastrado');
            return;
        }

        const cleanPhone = phone.replace(/\D/g, '');
        const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

        const agendamento = row.data_agendamento
            ? new Date(row.data_agendamento).toLocaleString('pt-BR')
            : 'Sem agendamento';

        const msg = `Olá, como vai? Tudo certo para a diligência de ${row.tipo_demanda}, ${agendamento}, ${row.descricao || ''}, ${row.cidade || ''}/${row.estado || ''}?`;
        const encodedMsg = encodeURIComponent(msg);
        const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedMsg}`;

        window.open(url, '_blank');
    };

    if (loading) return null;
    if (demands.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border border-orange-200 dark:border-red-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">Ações Urgentes (48h)</h3>
                    <span className="px-2 py-0.5 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs font-bold rounded-full">
                        {demands.length}
                    </span>
                </div>
                <Link to="/demandas" className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center">
                    Ver todas <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {demands.map(demanda => {
                    const date = new Date(demanda.data_agendamento);
                    const now = new Date();
                    const diffMs = date - now;
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

                    let timeLabel = '';
                    if (diffHrs < 1) timeLabel = 'Em menos de 1h';
                    else if (diffHrs < 24) timeLabel = `Em ${diffHrs}h`;
                    else timeLabel = 'Amanhã';

                    return (
                        <div key={demanda.id} className="bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {timeLabel}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {demanda.cidade}/{demanda.estado}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-white truncate" title={demanda.titulo}>
                                        {demanda.tipo_demanda}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {demanda.correspondente?.nome_fantasia || 'Sem correspondente'}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => handleWhatsAppClick(e, demanda)}
                                    className="ml-2 p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-full transition-colors shadow-sm"
                                    title="Cobrar no WhatsApp"
                                >
                                    <MessageCircle size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
