import React from 'react';

export function Timeline({ items, loading }) {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Nenhum andamento registrado
            </div>
        );
    }

    const tipoIcons = {
        criacao: '➕',
        atualizacao: '✏️',
        mudanca_status: '🔄',
        comentario: '💬',
        documento_adicionado: '📎',
        documento_removido: '🗑️',
        pagamento: '💰',
        outro: '📝',
    };

    const tipoColors = {
        criacao: 'bg-green-100 text-green-800 border-green-300',
        atualizacao: 'bg-blue-100 text-blue-800 border-blue-300',
        mudanca_status: 'bg-purple-100 text-purple-800 border-purple-300',
        comentario: 'bg-gray-100 text-gray-800 border-gray-300',
        documento_adicionado: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        documento_removido: 'bg-red-100 text-red-800 border-red-300',
        pagamento: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        outro: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {items.map((item, idx) => (
                    <li key={item.id}>
                        <div className="relative pb-8">
                            {idx !== items.length - 1 && (
                                <span
                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                />
                            )}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span
                                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white border ${tipoColors[item.tipo] || tipoColors.outro
                                            }`}
                                    >
                                        {tipoIcons[item.tipo] || tipoIcons.outro}
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.titulo}
                                        </p>
                                        {item.descricao && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.descricao}
                                            </p>
                                        )}
                                        {item.criador && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                por {item.criador.nome}
                                            </p>
                                        )}
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time dateTime={item.created_at}>
                                            {new Date(item.created_at).toLocaleString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function TimelineForm({ onSubmit, loading }) {
    const [formData, setFormData] = React.useState({
        tipo: 'comentario',
        titulo: '',
        descricao: '',
        visivel_cliente: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            tipo: 'comentario',
            titulo: '',
            descricao: '',
            visivel_cliente: false,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                    </label>
                    <select
                        value={formData.tipo}
                        onChange={(e) =>
                            setFormData({ ...formData, tipo: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="comentario">💬 Comentário</option>
                        <option value="atualizacao">✏️ Atualização</option>
                        <option value="mudanca_status">🔄 Mudança de Status</option>
                        <option value="documento_adicionado">📎 Documento</option>
                        <option value="pagamento">💰 Pagamento</option>
                        <option value="outro">📝 Outro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.titulo}
                        onChange={(e) =>
                            setFormData({ ...formData, titulo: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Ex: Cliente confirmou o horário"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                </label>
                <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Detalhes adicionais..."
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="visivel-cliente"
                    checked={formData.visivel_cliente}
                    onChange={(e) =>
                        setFormData({ ...formData, visivel_cliente: e.target.checked })
                    }
                    className="rounded text-primary-600"
                />
                <label
                    htmlFor="visivel-cliente"
                    className="text-sm font-medium text-gray-700"
                >
                    Visível para o cliente
                </label>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                    {loading ? 'Adicionando...' : 'Adicionar Andamento'}
                </button>
            </div>
        </form>
    );
}
