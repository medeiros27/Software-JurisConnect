import React from 'react';

export const Table = ({
    columns,
    data,
    loading,
    emptyMessage = 'Nenhum registro encontrado',
    selectable = false,
    selectedIds = [],
    onSelectionChange = () => { },
    idKey = 'id',
    stickyFirst = false,
    stickyLast = false,
    onRowClick
}) => {
    if (loading) {
        return (
            <div className="w-full p-8 text-center text-gray-500">
                <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="font-medium">Carregando dados...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {emptyMessage}
            </div>
        );
    }

    const allSelected = data.length > 0 && data.every(row => selectedIds.includes(row[idKey]));
    const someSelected = data.some(row => selectedIds.includes(row[idKey]));

    const handleSelectAll = () => {
        if (allSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(data.map(row => row[idKey]));
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const getStickyClass = (idx, total, type = 'body') => {
        const isFirst = idx === 0 && stickyFirst;
        const isLast = idx === total - 1 && stickyLast;

        if (!isFirst && !isLast) return '';

        const baseClass = isFirst ? 'sticky left-0' : 'sticky right-0';
        const zIndex = type === 'head' ? 'z-20' : 'z-10';
        const shadow = isFirst ? 'shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : 'shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]';

        // Background handling
        let bgClass = '';
        if (type === 'head') {
            bgClass = 'bg-gray-50 dark:bg-gray-700';
        } else {
            // For body, we need to match the row background and hover state
            // We use group-hover to match the row's hover effect
            bgClass = 'bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700';

            // If row is selected, we need to match that too (blue-50)
            // This is tricky with pure CSS classes if we want to override 'bg-white'
            // We'll handle selection bg in the row render logic or assume hover/white is enough for now,
            // but ideally sticky cells should be transparent? No, then content below shows.
            // We will rely on the fact that sticky cells need a background.
            // If selected, we might need a specific class.
        }

        return `${baseClass} ${zIndex} ${shadow} ${bgClass}`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {selectable && (
                            <th scope="col" className="px-3 py-2 text-left w-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = !allSelected && someSelected;
                                    }}
                                    onChange={handleSelectAll}
                                />
                            </th>
                        )}
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className={`px-3 py-2 text-left text-[10px] font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${getStickyClass(idx, columns.length, 'head')}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row, rowIdx) => {
                        const isSelected = selectedIds.includes(row[idKey]);
                        return (
                            <tr
                                key={rowIdx}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {selectable && (
                                    <td className="px-3 py-2 whitespace-nowrap w-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => handleSelectRow(row[idKey])}
                                        />
                                    </td>
                                )}
                                {columns.map((col, colIdx) => {
                                    let cellClass = `px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${getStickyClass(colIdx, columns.length, 'body')}`;

                                    // Fix for selected row background in sticky columns
                                    if (isSelected && (colIdx === 0 && stickyFirst || colIdx === columns.length - 1 && stickyLast)) {
                                        cellClass = cellClass.replace('bg-white', 'bg-blue-50').replace('dark:bg-gray-800', 'dark:bg-blue-900/20');
                                    }

                                    return (
                                        <td key={colIdx} className={cellClass}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
