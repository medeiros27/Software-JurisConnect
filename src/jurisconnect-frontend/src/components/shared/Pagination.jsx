import React from 'react';

/**
 * Componente de Paginação Moderno
 * Segue as melhores práticas de UX 2024
 */
export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Calcula quais números de página mostrar
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7; // Máximo de botões de página visíveis

        if (totalPages <= maxVisible) {
            // Mostra todas as páginas se forem poucas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas com elipses
            if (currentPage <= 4) {
                // Início: 1 2 3 4 5 ... 10
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Fim: 1 ... 6 7  8 9 10
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                // Meio: 1 ... 4 5 6 ... 10
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            {/* Info de itens exibidos */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span> de{' '}
                <span className="font-medium">{totalItems}</span> resultados
            </div>

            <div className="flex items-center gap-4">
                {/* Seletor de itens por página */}
                <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Por página:
                    </label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {/* Controles de navegação */}
                <nav className="flex items-center gap-1" aria-label="Pagination">
                    {/* Botão Previous */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(currentPage - 1);
                        }}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        aria-label="Página anterior"
                    >
                        ‹ Anterior
                    </button>

                    {/* Números de página */}
                    <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPageChange(page);
                                    }}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${page === currentPage
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    aria-label={`Página ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>

                    {/* Mobile: apenas número da página atual */}
                    <div className="sm:hidden px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentPage} / {totalPages}
                    </div>

                    {/* Botão Next */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onPageChange(currentPage + 1);
                        }}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        aria-label="Próxima página"
                    >
                        Próxima ›
                    </button>
                </nav>
            </div>
        </div>
    );
}
