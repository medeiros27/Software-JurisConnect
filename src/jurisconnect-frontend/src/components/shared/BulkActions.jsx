import React from 'react';

export function BulkActions({ selectedIds, onAction, actions }) {
    const [isOpen, setIsOpen] = React.useState(false);

    if (selectedIds.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-4 z-50">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 text-sm font-bold rounded-full">
                    {selectedIds.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                    {selectedIds.length} {selectedIds.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex gap-2">
                {actions.map((action) => (
                    <button
                        key={action.key}
                        onClick={() => {
                            onAction(action.key, selectedIds);
                        }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${action.variant === 'danger'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {action.icon && <span className="mr-1">{action.icon}</span>}
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function SelectableRow({ isSelected, onToggle, children }) {
    return (
        <tr
            className={`${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                } cursor-pointer transition-colors`}
            onClick={onToggle}
        >
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggle}
                    className="rounded text-primary-600 focus:ring-primary-500"
                />
            </td>
            {children}
        </tr>
    );
}

export function useSelection(items) {
    const [selectedIds, setSelectedIds] = React.useState([]);

    const isSelected = (id) => selectedIds.includes(id);

    const toggleSelection = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map((item) => item.id));
        }
    };

    const clearSelection = () => setSelectedIds([]);

    return {
        selectedIds,
        isSelected,
        toggleSelection,
        toggleAll,
        clearSelection,
        allSelected: selectedIds.length === items.length && items.length > 0,
    };
}
