import React from 'react';

/**
 * Componente de Badge para Tags coloridas
 */
export function TagBadge({ tag, onRemove, size = 'md' }) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
            style={{
                backgroundColor: `${tag.cor}20`,
                color: tag.cor,
                border: `1px solid ${tag.cor}`,
            }}
        >
            {tag.icone && <span>{tag.icone}</span>}
            <span>{tag.nome}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(tag.id);
                    }}
                    className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                    ×
                </button>
            )}
        </span>
    );
}

/**
 * Componente para seleção de tags
 */
export function TagSelector({ availableTags, selectedTags, onChange }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleToggleTag = (tagId) => {
        const isSelected = selectedTags.includes(tagId);
        if (isSelected) {
            onChange(selectedTags.filter(id => id !== tagId));
        } else {
            onChange([...selectedTags, tagId]);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex items-center justify-between hover:border-gray-400 transition-colors"
            >
                <span className="text-gray-700">
                    {selectedTags.length > 0
                        ? `${selectedTags.length} tag(s) selecionada(s)`
                        : 'Selecione as tags'}
                </span>
                <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {availableTags.map((tag) => (
                            <label
                                key={tag.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={() => handleToggleTag(tag.id)}
                                    className="rounded"
                                />
                                <TagBadge tag={tag} size="sm" />
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
