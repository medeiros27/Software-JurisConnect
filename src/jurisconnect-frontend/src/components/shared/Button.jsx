import React from 'react';
import clsx from 'clsx';

export const Button = ({
  children,
  variant = 'primary',    // primary, secondary, ghost, danger
  size = 'md',             // sm, md, lg
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-neutral-200 dark:bg-gray-700 text-neutral-900 dark:text-gray-200 hover:bg-neutral-300 dark:hover:bg-gray-600 active:bg-neutral-400 dark:active:bg-gray-500',
    ghost: 'bg-transparent text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/40',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        'font-medium rounded-md transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span>Carregando...</span> : children}
    </button>
  );
};
