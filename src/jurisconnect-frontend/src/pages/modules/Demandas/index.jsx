import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, Link as LinkIcon, RefreshCw, Copy, FileText, Download, CheckCircle, Upload, Users, DollarSign, Briefcase, Calendar, MapPin, X, Mail } from 'lucide-react';
import { SearchableSelect } from '../../../components/shared/SearchableSelect';
import { Card, CardHeader } from '../../../components/shared/Card';
import { Button } from '../../../components/shared/Button';
import { Badge } from '../../../components/shared/Badge';
import { Modal } from '../../../components/shared/Modal';
import { Select } from '../../../components/shared/Select';
import { Input } from '../../../components/shared/Input';
import { Pagination } from '../../../components/shared/Pagination';
import { StatCard } from '../../../components/shared/StatCard';
import { KanbanBoard } from '../../../components/kanban/KanbanBoard';
import { Table } from '../../../components/shared/Table';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useNotification } from '../../../hooks/useNotification';
import { ClienteModal } from '../Clientes/components/ClienteModal';
import { CorrespondenteModal } from '../Correspondentes/components/CorrespondenteModal';
import { DemandaMobileCard } from './components/DemandaMobileCard';

const parseCurrency = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

export default function DemandasList() {
  const [demandas, setDemandas] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showCorrespondenteModal, setShowCorrespondenteModal] = useState(false);
  const [editingDemanda, setEditingDemanda] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    cliente_id: '',
    correspondente_id: '',
  });

  const [clientes, setClientes] = useState([]);
  const [correspondentes, setCorrespondentes] = useState([]);


  const { success, error: showError } = useNotification();

  useEffect(() => {
    loadData();
    loadAuxData();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  const loadAuxData = async () => {
    try {
      console.log('Loading aux data...');
      const [clientesRes, correspondentesRes] = await Promise.all([
        api.get('/clientes', { params: { limit: 1000 } }),
        api.get('/correspondentes', { params: { limit: 1000 } }),
      ]);
      console.log('Clientes loaded:', clientesRes.data.data.clientes?.length);
      console.log('Correspondentes loaded:', correspondentesRes.data.data.correspondentes?.length);
      setClientes(clientesRes.data.data.clientes || []);
      setCorrespondentes(correspondentesRes.data.data.correspondentes || []);
    } catch (err) {
      console.error('Erro ao carregar dados auxiliares:', err);
    }
  };

  const handleEdit = (item) => {
    console.log('Editing item:', item);
    setEditingDemanda(item);
    loadAuxData(); // Ensure lists are loaded
    setShowModal(true);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [demandasResp, statsResp] = await Promise.all([
        api.get('/demandas', {
          params: {
            search: filters.search,
            ...filters,
            page: pagination.currentPage,
            limit: pagination.itemsPerPage,
          },
        }),
        api.get('/demandas/estatisticas'),
      ]);

      const responseData = demandasResp.data.data;
      setDemandas(responseData.demandas || []);
      setPagination(prev => ({
        ...prev,
        totalItems: responseData.pagination.total,
        totalPages: responseData.pagination.pages,
      }));
      setStatistics(statsResp.data.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
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



  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDemanda(null);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId;
    const demandaId = parseInt(draggableId);

    const updatedDemandas = demandas.map(d =>
      d.id === demandaId ? { ...d, status: newStatus } : d
    );
    setDemandas(updatedDemandas);

    try {
      await api.put(`/demandas/${demandaId}`, { status: newStatus });
      toast.success('Status atualizado!');
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status');
      loadData();
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} demandas?`)) return;

    try {
      await api.post('/demandas/bulk/delete', { ids: selectedIds });
      success(`${selectedIds.length} demandas excluídas com sucesso`);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      showError('Erro ao excluir demandas');
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!newStatus) return;
    if (!window.confirm(`Deseja alterar o status de ${selectedIds.length} demandas para "${newStatus.replace('_', ' ').toUpperCase()}"?`)) return;

    try {
      await api.post('/demandas/bulk/update', {
        ids: selectedIds,
        update_data: { status: newStatus }
      });
      success(`${selectedIds.length} demandas atualizadas com sucesso`);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      showError('Erro ao atualizar status das demandas');
    }
  };

  const columns = [
    {
      key: 'numero',
      label: 'Protocolo',
      render: (value) => <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">{value}</span>
    },
    {
      key: 'tipo_demanda',
      label: 'Tipo',
      render: (value) => <span className="capitalize text-xs whitespace-nowrap">{value}</span>
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (value) => <span className="text-xs truncate max-w-[100px] block" title={value?.nome_fantasia}>{value?.nome_fantasia || '-'}</span>
    },
    {
      key: 'data_agendamento',
      label: 'Agendamento',
      render: (value, row) => {
        if (!value) return <span className="text-xs text-gray-400">-</span>;
        const date = new Date(value);
        const now = new Date();
        const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const isUrgent = date >= now && date <= next48h && row.status !== 'concluida' && row.status !== 'cancelada';

        return (
          <div className="flex items-center gap-1">
            {isUrgent && <Clock className="w-3 h-3 text-red-500 animate-pulse" title="Prazo Urgente (<48h)" />}
            <span className="text-xs whitespace-nowrap">{date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
          </div>
        );
      }
    },
    {
      key: 'correspondente',
      label: 'Correspondente',
      render: (_, row) => (
        <span className={`text-xs truncate max-w-[100px] block ${row.correspondente ? "text-gray-700 dark:text-gray-300" : "text-gray-400 italic"}`} title={row.correspondente?.nome_fantasia}>
          {row.correspondente ? row.correspondente.nome_fantasia : 'Sem correspondente'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge type={value}><span className="text-xs">{value.replace('_', ' ').toUpperCase()}</span></Badge>
    },
    {
      key: 'cidade',
      label: 'Cidade',
      render: (_, row) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap" title={`${row.cidade || ''}, ${row.estado || ''}`}>
          {row.cidade ? `${row.cidade}/${row.estado || ''}` : '-'}
        </span>
      )
    },
    {
      key: 'valor_cobrado',
      label: 'Valor Cliente',
      render: (value) => <span className="text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)}</span>
    },
    {
      key: 'valor_custo',
      label: 'Valor Corresp.',
      render: (value) => <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)}</span>
    },
    {
      key: 'lucro',
      label: 'Lucro',
      render: (_, row) => {
        const lucro = (parseFloat(row.valor_cobrado) || 0) - (parseFloat(row.valor_custo) || 0);
        const lucroFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucro);
        return (
          <span className={`text-xs font-semibold whitespace-nowrap ${lucro > 0 ? 'text-green-600 dark:text-green-400' : lucro < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {lucroFormatted}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => {
        const handleWhatsAppClick = (e) => {
          e.stopPropagation(); // Prevent row click

          const phone = row.correspondente?.celular || row.correspondente?.telefone;

          if (!phone) {
            toast.error('Correspondente sem telefone cadastrado');
            return;
          }

          // Clean phone number (remove non-digits)
          const cleanPhone = phone.replace(/\D/g, '');
          const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

          const agendamento = row.data_agendamento
            ? new Date(row.data_agendamento).toLocaleString('pt-BR')
            : 'Sem agendamento';

          const msg = `Olá, como vai? Tudo certo para a seguinte diligência: ${row.tipo_demanda}, dia ${agendamento},  ${row.processo || 'Sem descrição'}, ${row.descricao}, na cidade: ${row.cidade || ''}/${row.estado || ''}?`;
          const encodedMsg = encodeURIComponent(msg);
          const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedMsg}`;

          window.open(url, '_blank');
        };

        return (
          <div className="flex items-center gap-1">
            <button
              onClick={handleWhatsAppClick}
              className={`p-2 rounded-full transition-colors ${row.correspondente?.celular || row.correspondente?.telefone
                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-gray-400 cursor-not-allowed'
                }`}
              title={row.correspondente?.celular || row.correspondente?.telefone ? "Enviar mensagem no WhatsApp" : "Correspondente sem telefone"}
              disabled={!row.correspondente?.celular && !row.correspondente?.telefone}
            >
              <MessageCircle size={20} />
            </button>

            <button
              onClick={async (e) => {
                e.stopPropagation();

                if (!row.correspondente) {
                  toast.error('Demanda sem correspondente associado');
                  return;
                }

                if (!row.correspondente.email) {
                  toast.error('Correspondente sem e-mail cadastrado');
                  return;
                }

                try {
                  toast.loading('Enviando e-mail...', { id: 'send-email' });
                  await api.post(`/demandas/${row.id}/enviar-contrato`);
                  toast.success('E-mail de contrato enviado com sucesso!', { id: 'send-email' });
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Erro ao enviar e-mail', { id: 'send-email' });
                }
              }}
              className={`p-2 rounded-full transition-colors ${row.correspondente?.email
                ? 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                : 'text-gray-400 cursor-not-allowed'
                }`}
              title={row.correspondente?.email ? "Enviar contrato por e-mail" : "Correspondente sem e-mail"}
              disabled={!row.correspondente?.email}
            >
              <Mail size={20} />
            </button>

            {row.access_token && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const url = `${window.location.origin}/externo/demanda/${row.access_token}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Link externo copiado!');
                  }}
                  className="p-2 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Copiar Link Externo"
                >
                  <Copy size={20} />
                </button>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!window.confirm('Tem certeza? O link anterior deixará de funcionar.')) return;
                    try {
                      await api.post(`/demandas/${row.id}/revoke-token`);
                      toast.success('Acesso revogado. Novo link gerado.');
                      loadData();
                    } catch (err) {
                      toast.error('Erro ao revogar acesso');
                    }
                  }}
                  className="p-2 rounded-full text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  title="Revogar Acesso (Gerar Novo Link)"
                >
                  <RefreshCw size={20} />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total" value={statistics.total} icon="📋" color="blue" />
          <StatCard title="Pendentes" value={statistics.pendentes} icon="⏳" color="orange" />
          <StatCard title="Em Andamento" value={statistics.em_andamento} icon="⚙️" color="purple" />
          <StatCard title="Concluídas" value={statistics.concluidas} icon="✓" color="green" />
          <StatCard title="Atrasadas" value={statistics.atrasadas} icon="⚠️" color="red" />
        </div>
      )}




      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 flex items-center justify-between animate-fade-in">
          <span className="text-blue-800 dark:text-blue-300 font-medium">
            {selectedIds.length} demanda(s) selecionada(s)
          </span>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-blue-200 dark:border-blue-800 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Alterar Status...</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="aguardando_correspondente">Aguardando Corresp.</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <Button variant="danger" onClick={handleBulkDelete}>
              Excluir Selecionados
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader
          title="Demandas"
          subtitle="Gerenciamento de processos e solicitações"
          action={
            <div className="flex gap-2">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                  📊 Lista
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                  📋 Kanban
                </button>
              </div>
              <Button onClick={() => {
                setEditingDemanda(null);
                setShowModal(true);
              }}>➕ Nova Demanda</Button>
            </div>
          }
        />

        {/* Filtros */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => document.getElementById('mobile-filters').classList.toggle('hidden')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              🔍 Filtrar & Buscar
            </button>
          </div>

          <div id="mobile-filters" className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="🔍 Buscar..."
                defaultValue={filters.search}
                onChange={(e) => {
                  const value = e.target.value;
                  // Debounce manual
                  if (window.searchTimeout) clearTimeout(window.searchTimeout);
                  window.searchTimeout = setTimeout(() => {
                    setFilters(prev => ({ ...prev, search: value }));
                  }, 500);
                }}
              />
            </div>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'Todos os Status' },
                { value: 'rascunho', label: 'Rascunho' },
                { value: 'pendente', label: 'Pendente' },
                { value: 'em_andamento', label: 'Em Andamento' },
                { value: 'aguardando_correspondente', label: 'Aguardando Corresp.' },
                { value: 'concluida', label: 'Concluída' },
                { value: 'cancelada', label: 'Cancelada' },
              ]}
            />
            <Input
              type="date"
              value={filters.data_inicio || ''}
              onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
              placeholder="Data Início"
            />
            <Input
              type="date"
              value={filters.data_fim || ''}
              onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
              placeholder="Data Fim"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFilters(prev => ({ ...prev, data_inicio: today, data_fim: today }));
              }}
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              📅 Hoje
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const next7 = new Date(today);
                next7.setDate(today.getDate() + 7);
                setFilters(prev => ({
                  ...prev,
                  data_inicio: today.toISOString().split('T')[0],
                  data_fim: next7.toISOString().split('T')[0]
                }));
              }}
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              📅 Próximos 7 dias
            </button>
          </div>
        </div>

        {
          viewMode === 'list' ? (
            <>
              <div className="md:hidden space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : demandas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhuma demanda encontrada</div>
                ) : (
                  demandas.map(demanda => (
                    <DemandaMobileCard
                      key={demanda.id}
                      demanda={demanda}
                      onClick={handleEdit}
                    />
                  ))
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block">
                <Table
                  columns={columns}
                  data={demandas}
                  loading={loading}
                  selectable
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  stickyFirst={true}
                  stickyLast={true}
                  onRowClick={handleEdit}
                />
              </div>

              {!loading && demandas.length > 0 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          ) : (
            <KanbanBoard
              demandas={demandas}
              onDragEnd={handleDragEnd}
              onEdit={handleEdit}
            />
          )
        }
      </Card >

      <DemandaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={() => {
          loadData();
          handleCloseModal();
        }}
        demanda={editingDemanda}
        clientes={clientes}
        correspondentes={correspondentes}

        onCreateCliente={() => setShowClienteModal(true)}
        onCreateCorrespondente={() => setShowCorrespondenteModal(true)}
      />

      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSuccess={() => {
          loadAuxData();
          setShowClienteModal(false);
        }}
      />

      <CorrespondenteModal
        isOpen={showCorrespondenteModal}
        onClose={() => setShowCorrespondenteModal(false)}
        onSuccess={() => {
          loadAuxData();
          setShowCorrespondenteModal(false);
        }}
      />
    </div >
  );
}


const TIPOS_DEMANDA = [
  { value: 'audiencia', label: 'Audiência' },
  { value: 'una_presencial', label: 'UNA - Presencial' },
  { value: 'instrucao_presencial', label: 'Instrução - Presencial' },
  { value: 'inicial_presencial', label: 'Inicial - Presencial' },
  { value: 'coleta_assinaturas', label: 'Coleta de Assinaturas' },
  { value: 'conciliacao_presencial', label: 'Conciliação - Presencial' },
  { value: 'protocolo', label: 'Protocolo' },
  { value: 'acompanhamento', label: 'Acompanhamento' },
  { value: 'visitas_in_loco', label: 'Visitas In Loco' },
  { value: 'acompanhamento_pericia', label: 'Acompanhamento de Perícia' },
  { value: 'sustentacao_oral', label: 'Sustentação Oral' },
  { value: 'copias', label: 'Cópias' },
  { value: 'despacho', label: 'Despacho' },
  { value: 'certidao_cartorio', label: 'Certidão de Cartório' },
  { value: 'andamento', label: 'Andamento' },
  { value: 'coleta', label: 'Coleta' },
  { value: 'atendimento_coleta_assinatura', label: 'Atendimento e Coleta de Assinatura' },
  { value: 'instrucao_virtual', label: 'Instrução - Virtual' },
  { value: 'diligencia', label: 'Diligência (Genérica)' },
  { value: 'intimacao', label: 'Intimação' },
  { value: 'outro', label: 'Outro' },
];

const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

function DemandaModal({ isOpen, onClose, onSuccess, demanda, clientes, correspondentes, especialidades, onCreateCliente, onCreateCorrespondente }) {
  const [formData, setFormData] = useState({
    tipo_demanda: 'diligencia',
    status: 'pendente',
    cliente_id: '',
    correspondente_id: '',
    equipe: [],
    local: '',

    descricao: '',
    cidade: '',
    estado: '',
    valor_estimado: '',
    valor_cobrado: '',
    valor_custo: '',
    status_pagamento_cliente: 'pendente',
    status_pagamento_correspondente: 'pendente'
  });
  const [loading, setLoading] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [documentos, setDocumentos] = useState([]);
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [uploading, setUploading] = useState(false);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const fetchCidades = async () => {
      if (!formData.estado) {
        setCidades([]);
        return;
      }

      setLoadingCidades(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`);
        const data = await response.json();
        const cidadesFormatadas = data.map(city => ({
          value: city.nome,
          label: city.nome
        }));
        setCidades(cidadesFormatadas);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setLoadingCidades(false);
      }
    };

    fetchCidades();
  }, [formData.estado]);

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSearchingDataJud, setIsSearchingDataJud] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!formData.cidade || !formData.estado) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await api.get('/correspondentes/sugestoes', {
          params: { cidade: formData.cidade, estado: formData.estado }
        });
        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.cidade, formData.estado]);

  // DataJud Integration (Universal Link Helper)
  useEffect(() => {
    const consultarCNJ = async () => {
      // Remove non-numeric characters
      const cnj = formData.processo?.replace(/\D/g, '') || '';

      // CNJ must be 20 digits to be valid for search
      if (cnj.length === 20) {
        // Universal Direct Link (No Auto-Fill)

        // Extract TRT code from CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
        const parts = cnj.replace(/\D/g, '').replace(/(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, '$1-$2.$3.$4.$5.$6').split('.');
        let trtLink = null;

        if (parts.length >= 5) {
          const trtCode = parts[3]; // '02', '05', etc.
          if (trtCode === '02') trtLink = 'https://pje.trt2.jus.br/consultaprocessual/';
          else if (trtCode === '05') trtLink = 'https://portalpje.trt5.jus.br/';
          else if (['01', '03', '04', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'].includes(trtCode)) {
            // Generic guess for other TRTs
            trtLink = `https://pje.trt${parseInt(trtCode)}.jus.br/consultaprocessual/`;
          }
        }

        if (trtLink) {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <span className="font-medium">Consulta Rápida Disponível</span>
              <a
                href={trtLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1 font-bold"
                onClick={() => toast.dismiss(t.id)}
              >
                <LinkIcon size={14} />
                Abrir Consulta Oficial do Tribunal
              </a>
            </div>
          ), { duration: 8000, icon: '⚖️' });
        }
      }
    };

    const timer = setTimeout(consultarCNJ, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [formData.processo]);

  const getDownloadLink = (url) => {
    try {
      if (!url) return '#';
      if (url.startsWith('http')) return url;
      const baseUrl = api.defaults?.baseURL?.split('/api')[0] || '';
      if (url.startsWith('/uploads')) return `${baseUrl}${url}`;
      const filename = url.split(/[/\\]/).pop();
      return `${baseUrl}/uploads/${filename}`;
    } catch (error) {
      console.error('Erro ao gerar link de download:', error);
      return '#';
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/demandas/${demanda.id}/arquivos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Arquivo enviado com sucesso!');

      // Reload demand to show new file
      const response = await api.get(`/demandas/${demanda.id}`);
      setDocumentos(response.data.data.documentos || []);
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast.error('Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    const loadFullDemanda = async () => {
      if (demanda && demanda.id) {
        try {
          const response = await api.get(`/demandas/${demanda.id}`);
          const fullDemanda = response.data.data;

          const receita = fullDemanda.pagamentos?.find(p => p.tipo === 'receber');
          const despesa = fullDemanda.pagamentos?.find(p => p.tipo === 'pagar');

          setFormData(prev => ({
            ...prev,
            processo: fullDemanda.processo || '', // Ensure processo is updated from fresh data
            local: fullDemanda.local || '',
            status_pagamento_cliente: receita?.status || 'pendente',
            status_pagamento_correspondente: despesa?.status || 'pendente',
            equipe: fullDemanda.equipe ? fullDemanda.equipe.map(m => {
              const junction = m.demanda_correspondentes || m.DemandaCorrespondentes || m.DemandaCorrespondente || {};
              console.log('Membro carregado:', m.nome_fantasia, 'Junction:', junction);
              return {
                id: String(m.id),
                valor: junction.valor || '',
                status_pagamento: junction.status_pagamento || 'pendente'
              };
            }) : []
          }));

          setDocumentos(fullDemanda.documentos || []);
        } catch (error) {
          console.error('Erro ao carregar detalhes da demanda:', error);
        }
      }
    };

    if (demanda) {
      let tipo = 'diligencia';
      if (demanda.tipo_demanda) {
        const found = TIPOS_DEMANDA.find(t => t.value === demanda.tipo_demanda || t.label === demanda.tipo_demanda);
        if (found) tipo = found.value;
      }

      setFormData({
        tipo_demanda: tipo,
        status: demanda.status || 'pendente',
        cliente_id: demanda.cliente_id ? String(demanda.cliente_id) : '',
        correspondente_id: demanda.correspondente_id ? String(demanda.correspondente_id) : '',
        equipe: demanda.equipe ? demanda.equipe.map(m => ({
          id: String(m.id),
          valor: m.demanda_correspondentes ? m.demanda_correspondentes.valor : '',
          status_pagamento: m.demanda_correspondentes ? m.demanda_correspondentes.status_pagamento : 'pendente'
        })) : [],

        data_agendamento: demanda.data_agendamento ? (() => {
          const date = new Date(demanda.data_agendamento);
          const offset = date.getTimezoneOffset() * 60000;
          const localDate = new Date(date.getTime() - offset);
          return localDate.toISOString().slice(0, 16);
        })() : '',
        descricao: demanda.descricao || '',
        processo: demanda.processo || '',
        local: demanda.local || '',
        cidade: demanda.cidade || '',
        estado: demanda.estado || '',
        valor_cobrado: demanda.valor_cobrado ? String(demanda.valor_cobrado).replace('.', ',') : '',
        valor_custo: demanda.valor_custo ? String(demanda.valor_custo).replace('.', ',') : '',
        valor_estimado: demanda.valor_estimado ? String(demanda.valor_estimado).replace('.', ',') : '',
        status_pagamento_cliente: 'pendente',
        status_pagamento_correspondente: 'pendente'
      });

      loadFullDemanda();
    } else {
      setFormData({
        tipo_demanda: 'diligencia',
        status: 'pendente',
        cliente_id: '',
        correspondente_id: '',
        equipe: [],

        data_agendamento: '',
        descricao: '',
        processo: '',
        local: '',
        cidade: '',
        estado: '',
        valor_cobrado: '',
        valor_custo: '',
        valor_estimado: '',
        status_pagamento_cliente: 'pendente',
        status_pagamento_correspondente: 'pendente'
      });
      setDocumentos([]);
    }
  }, [demanda, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tipoObj = TIPOS_DEMANDA.find(t => t.value === formData.tipo_demanda);
      const tituloAutomatico = tipoObj ? tipoObj.label : formData.tipo_demanda;

      const parseCurrency = (value) => {
        if (!value) return 0;
        if (typeof value === 'number') return value;

        let cleanValue = value.toString().replace(/[R$\s]/g, '');

        if (cleanValue.includes(',') && cleanValue.includes('.')) {
          cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
        } else if (cleanValue.includes(',')) {
          cleanValue = cleanValue.replace(',', '.');
        }

        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
      };

      if (!formData.cliente_id) {
        toast.error('Por favor, selecione um cliente.');
        setLoading(false);
        return;
      }

      const payload = {
        // ...formData, // Removed to avoid sending invalid fields like valor_estimado
        descricao: formData.descricao,
        local: formData.local,
        cidade: formData.cidade,
        estado: formData.estado,
        tipo_demanda: formData.tipo_demanda,
        prioridade: 'alta',
        titulo: tituloAutomatico,
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        correspondente_id: formData.correspondente_id ? parseInt(formData.correspondente_id) : null,
        valor_cobrado: parseCurrency(formData.valor_cobrado),
        valor_custo: parseCurrency(formData.valor_custo),
        processo: formData.processo,
        data_agendamento: formData.data_agendamento || null,
        status_pagamento_cliente: formData.status_pagamento_cliente,
        status_pagamento_correspondente: formData.status_pagamento_correspondente,
        equipe: formData.equipe.map(member => {
          if (typeof member === 'object') {
            return {
              id: parseInt(member.id),
              valor: parseCurrency(member.valor),
              status_pagamento: member.status_pagamento
            };
          }
          return { id: parseInt(member), valor: 0, status_pagamento: 'pendente' };
        })
      };
      console.log('Payload enviado:', payload);

      if (demanda) {
        await api.put(`/demandas/${demanda.id}`, payload);
        toast.success('Demanda atualizada com sucesso!');
      } else {
        await api.post('/demandas', payload);
        toast.success('Demanda criada com sucesso!');
      }
      onSuccess();
    } catch (err) {
      console.error('Erro ao salvar demanda:', err);
      toast.error(err.response?.data?.message || 'Erro ao salvar demanda');
    } finally {
      setLoading(false);
    }
  };

  console.log('RENDER DemandaModal. Equipe:', formData.equipe);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={demanda ? `Editar Demanda - ${demanda.numero}` : 'Nova Demanda'}
      size="xl"
    >
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        {[
          { id: 'visao_geral', label: 'Visão Geral', icon: Briefcase },
          { id: 'envolvidos', label: 'Envolvidos', icon: Users },
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
          { id: 'documentos', label: `Arquivos (${documentos.length})`, icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* TAB: VISÃO GERAL */}
        {activeTab === 'visao_geral' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo da Diligência *</label>
                <select
                  name="tipo_demanda"
                  value={formData.tipo_demanda}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {TIPOS_DEMANDA.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <Input
                    label="Processo (CNJ)"
                    name="processo"
                    placeholder="0000000-00.0000.0.00.0000"
                    value={formData.processo}
                    onChange={handleChange}
                    className={isSearchingDataJud ? "border-blue-400 ring-2 ring-blue-100 transition-all" : ""}
                  />
                  {isSearchingDataJud && (
                    <div className="absolute right-0 -bottom-5 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                      <span className="text-xs text-blue-600 font-medium">Buscando dados...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Input
                  label="Data do Agendamento"
                  name="data_agendamento"
                  type="datetime-local"
                  value={formData.data_agendamento}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  label="Local (Vara, Repartição, Endereço)"
                  name="local"
                  placeholder="Ex: 2ª Vara do Trabalho"
                  value={formData.local}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado (UF)</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione o Estado</option>
                  {ESTADOS_BRASIL.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <SearchableSelect
                  label="Cidade"
                  placeholder={loadingCidades ? "Carregando cidades..." : "Selecione a cidade..."}
                  options={cidades}
                  value={formData.cidade}
                  onChange={(val) => handleChange({ target: { name: 'cidade', value: val } })}
                  disabled={!formData.estado}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Descrição / Instruções</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows="4"
                placeholder="Descreva os detalhes da diligência..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              ></textarea>
            </div>
          </div>
        )}

        {/* TAB: ENVOLVIDOS */}
        {activeTab === 'envolvidos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Cliente Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Cliente (Solicitante)
              </h3>
              <SearchableSelect
                required
                placeholder="Selecione o cliente..."
                options={clientes.map(c => ({ value: c.id, label: c.nome_fantasia }))}
                value={formData.cliente_id}
                onChange={(val) => handleChange({ target: { name: 'cliente_id', value: val } })}
                onCreate={onCreateCliente}
              />
            </div>

            {/* Equipe de Execução Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Equipe de Execução
              </h3>

              <div className="space-y-3">
                {/* Correspondent Card (Simulating a list item) */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correspondente Principal</label>
                    <SearchableSelect
                      placeholder="Selecione o correspondente..."
                      options={correspondentes.map(c => ({ value: c.id, label: c.nome_fantasia }))}
                      value={formData.correspondente_id}
                      onChange={(val) => handleChange({ target: { name: 'correspondente_id', value: val } })}
                      onCreate={onCreateCorrespondente}
                    />

                    {/* WhatsApp Button */}
                    {formData.correspondente_id && (() => {
                      const selected = correspondentes.find(c => String(c.id) === String(formData.correspondente_id));
                      if (selected && selected.telefone) {
                        const tipoLabel = TIPOS_DEMANDA.find(t => t.value === formData.tipo_demanda)?.label || formData.tipo_demanda;
                        const dataFormatada = formData.data_agendamento ? new Date(formData.data_agendamento).toLocaleString() : 'A definir';
                        const processo = formData.processo || 'Sem descrição';
                        const descricao = formData.descricao || 'Sem descrição';

                        const message = `Olá, como vai?\n\nPrecisamos de um correspondente para participar da seguinte diligência:\n\n*${tipoLabel}*\n- ${dataFormatada}\n- ${processo}\n- ${descricao}\n- ${formData.local || 'Local a definir'}\n- ${formData.cidade}/${formData.estado}\n\nTem disponibilidade?\nSe sim, qual o valor?`;
                        const link = `https://wa.me/55${selected.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

                        return (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md w-fit transition-colors"
                          >
                            <MessageCircle size={16} />
                            Consultar disponibilidade via WhatsApp
                          </a>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Additional Team Members */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Membros Adicionais da Equipe</label>

                    </div>

                    {/* List of existing team members */}
                    {formData.equipe.map((member, index) => {
                      // member can be an ID (string) or an object { id, valor, status_pagamento }
                      const memberId = typeof member === 'object' ? member.id : member;
                      const memberValor = typeof member === 'object' ? member.valor : '';
                      const memberStatus = typeof member === 'object' ? member.status_pagamento : 'pendente';

                      const correspondentData = correspondentes.find(c => String(c.id) === String(memberId));

                      const updateMember = (field, value) => {
                        const newEquipe = [...formData.equipe];
                        if (typeof newEquipe[index] !== 'object') {
                          newEquipe[index] = { id: newEquipe[index], valor: '', status_pagamento: 'pendente' };
                        }
                        newEquipe[index] = { ...newEquipe[index], [field]: value };
                        setFormData(prev => ({ ...prev, equipe: newEquipe }));
                      };

                      return (
                        <div key={index} className="flex flex-col gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {correspondentData ? correspondentData.nome_fantasia : 'Carregando...'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newEquipe = [...formData.equipe];
                                newEquipe.splice(index, 1);
                                setFormData(prev => ({ ...prev, equipe: newEquipe }));
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remover"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Payment fields for this member */}
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Valor (R$)"
                              value={memberValor}
                              onChange={(e) => updateMember('valor', e.target.value)}
                              placeholder="0,00"
                              className="bg-white dark:bg-gray-800"
                            />
                            <div>
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Status Pagamento</label>
                              <select
                                value={memberStatus}
                                onChange={(e) => updateMember('status_pagamento', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                                <option value="atrasado">Atrasado</option>
                                <option value="cancelado">Cancelado</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Member Select */}
                    {/* Add Member Select */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <SearchableSelect
                          placeholder="Selecionar membro..."
                          options={correspondentes
                            .filter(c => String(c.id) !== String(formData.correspondente_id) && !formData.equipe.some(m => m && String(typeof m === 'object' ? m.id : m) === String(c.id)))
                            .map(c => ({ value: c.id, label: c.nome_fantasia }))}
                          value={selectedMemberToAdd}
                          onChange={setSelectedMemberToAdd}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (selectedMemberToAdd) {
                            setFormData(prev => {
                              const currentEquipe = Array.isArray(prev.equipe) ? prev.equipe : [];
                              if (currentEquipe.some(m => m && String(typeof m === 'object' ? m.id : m) === String(selectedMemberToAdd))) {
                                return prev;
                              }
                              return {
                                ...prev,
                                equipe: [...currentEquipe, { id: selectedMemberToAdd, valor: '', status_pagamento: 'pendente' }]
                              };
                            });
                            setSelectedMemberToAdd('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedMemberToAdd}
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggestions Block */}
                {(loadingSuggestions || suggestions.length > 0) && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                      ✨ Recomendados em {formData.cidade}/{formData.estado}
                    </p>

                    {loadingSuggestions ? (
                      <div className="text-xs text-gray-500 animate-pulse">Buscando melhores opções...</div>
                    ) : (
                      <div className="space-y-2">
                        {suggestions.map(sug => {
                          const tipoLabel = TIPOS_DEMANDA.find(t => t.value === formData.tipo_demanda)?.label || formData.tipo_demanda;
                          const dataFormatada = formData.data_agendamento ? new Date(formData.data_agendamento).toLocaleString() : 'A definir';
                          const descricaoTexto = formData.descricao || '';
                          const processo = formData.processo || 'Sem descrição';

                          const message = `Olá, como vai?\n\nPrecisamos de um correspondente para participar da seguinte diligência:\n\n*${tipoLabel}*\n- ${dataFormatada}\n- ${processo}\n- ${descricaoTexto}\n- ${formData.local || 'Local a definir'}\n- ${formData.cidade}/${formData.estado}\n\nTem disponibilidade?\nSe sim, qual o valor?`;
                          const link = `https://wa.me/55${sug.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

                          return (
                            <div
                              key={sug.id}
                              className={`
                                flex items-center justify-between p-2 rounded transition-colors border
                                ${String(formData.correspondente_id) === String(sug.id)
                                  ? 'bg-blue-100 border-blue-300 dark:bg-blue-800 dark:border-blue-600'
                                  : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'}
                              `}
                            >
                              <div
                                className="flex flex-col flex-1 cursor-pointer"
                                onClick={() => handleChange({ target: { name: 'correspondente_id', value: String(sug.id) } })}
                              >
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{sug.nome_fantasia}</span>
                                <span className="text-xs text-gray-500">
                                  ⭐ {sug.classificacao || 'N/A'} • {sug.cidade_sediado}/{sug.estado_sediado}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {sug.telefone && (
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-green-600 hover:bg-green-100 rounded-full dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
                                    title="Consultar no WhatsApp"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MessageCircle size={16} />
                                  </a>
                                )}
                                {String(formData.correspondente_id) === String(sug.id) && (
                                  <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">Selecionado</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FINANCEIRO */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receita Card */}
              <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Receita (Cliente)
                  </h3>
                  <select
                    name="status_pagamento_cliente"
                    value={formData.status_pagamento_cliente}
                    onChange={handleChange}
                    className="text-xs px-2 py-1 rounded-full border-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-1 focus:ring-green-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Input
                    label="Valor Cobrado (R$)"
                    name="valor_cobrado"
                    type="text"
                    value={formData.valor_cobrado}
                    onChange={handleChange}
                    className="bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Despesa Card */}
              <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Despesa (Correspondente)
                  </h3>
                  <select
                    name="status_pagamento_correspondente"
                    value={formData.status_pagamento_correspondente}
                    onChange={handleChange}
                    className="text-xs px-2 py-1 rounded-full border-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:ring-1 focus:ring-red-500"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Input
                    label="Valor Custo (R$)"
                    name="valor_custo"
                    type="text"
                    value={formData.valor_custo}
                    onChange={handleChange}
                    className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-700 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ARQUIVOS */}
        {activeTab === 'documentos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {documentos.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>Nenhum documento anexado a esta demanda.</p>
              </div>
            )}

            {/* Arquivos do Escritório */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Arquivos do Escritório
                </h4>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    {uploading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {uploading ? 'Enviando...' : 'Anexar Arquivo'}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {documentos.filter(d => d && d.criado_por).length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum arquivo interno.</p>
                ) : (
                  documentos.filter(d => d && d.criado_por).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.nome}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={getDownloadLink(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Baixar/Visualizar"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Arquivos do Correspondente */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Arquivos do Correspondente
              </h4>
              <div className="space-y-2">
                {documentos.filter(d => d && !d.criado_por).length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum arquivo enviado pelo correspondente.</p>
                ) : (
                  documentos.filter(d => d && !d.criado_por).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.nome}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleString()} • Via Link Externo
                          </p>
                        </div>
                      </div>
                      <a
                        href={getDownloadLink(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Baixar/Visualizar"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal >
  );
}

