import React from 'react';

export function TagBadge({ tag, onRemove, size = 'md' }) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
            style={{
                backgroundColor: tag.cor + '20',
                color: tag.cor,
                border: `1px solid ${tag.cor}`,
            }}
        >
            {tag.icone && <span>{tag.icone}</span>}
            <span>{tag.nome}</span>
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(tag.id);
                    }}
                    className="ml-0.5 hover:bg-black/10 rounded-full p-0.5"
                >
                    ×
                </button>
            )}
        </span>
    );
}

export function TagSelector({ tags, selectedTags = [], onChange }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleTag = (tagId) => {
        const isSelected = selectedTags.includes(tagId);
        const newSelection = isSelected
            ? selectedTags.filter((id) => id !== tagId)
            : [...selectedTags, tagId];
        onChange(newSelection);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
                🏷️ Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-64">
                        {tags.map((tag) => (
                            <label
                                key={tag.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={() => toggleTag(tag.id)}
                                    className="rounded text-primary-600"
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
