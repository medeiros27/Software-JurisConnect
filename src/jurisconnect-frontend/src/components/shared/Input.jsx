import React, { forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(({
  label,
  error,
  required,
  hint,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
          {label}
          {required && <span className="text-error-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          'px-3 py-2 rounded-md border-2 border-neutral-200 dark:border-gray-600 bg-white dark:bg-gray-800',
          'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900',
          'placeholder-neutral-400 dark:placeholder-gray-500 text-neutral-900 dark:text-white',
          'transition-colors duration-200',
          error && 'border-error-500 focus:border-error-500 focus:ring-error-100',
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-error-500">{error}</span>}
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
