import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export function SearchableSelect({
    options = [],
    value,
    onChange,
    label,
    placeholder = "Selecione...",
    required,
    error,

    className,
    onCreate
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    // Encontrar o label da opção selecionada
    const selectedOption = options.find(opt => String(opt.value) === String(value));

    useEffect(() => {
        // Fechar ao clicar fora
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrar opções
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={clsx("flex flex-col gap-1 relative", className)} ref={wrapperRef}>
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Input invisível para validação nativa do formulário */}
            <input
                type="text"
                value={value || ''}
                required={required}
                onChange={() => { }}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                tabIndex={-1}
            />

            <div
                className={clsx(
                    "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 cursor-pointer flex justify-between items-center transition-all duration-200",
                    error ? "border-red-500 ring-1 ring-red-100" : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500",
                    isOpen && "ring-2 ring-primary-100 dark:ring-primary-900/30 border-primary-500"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={clsx("truncate", selectedOption ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={clsx("w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200", isOpen && "transform rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-hidden animate-fade-in-down">
                    <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
                                placeholder="Pesquisar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-48">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className={clsx(
                                        "px-3 py-2 text-sm cursor-pointer transition-colors border-l-2 border-transparent",
                                        String(value) === String(opt.value)
                                            ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium border-primary-500"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:hover:border-gray-600"
                                    )}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center flex flex-col items-center gap-2">
                                <span className="text-xl">🔍</span>
                                <span>Nenhum resultado encontrado</span>
                                {onCreate && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreate();
                                            setIsOpen(false);
                                        }}
                                        className="mt-2 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                                    >
                                        + Cadastrar Novo
                                    </button>
                                )}
                            </div>
                        )}
                        {onCreate && filteredOptions.length > 0 && (
                            <div
                                className="px-3 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCreate();
                                    setIsOpen(false);
                                }}
                            >
                                <span>+</span> Cadastrar Novo
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
        </div>
    );
}
