import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className = '', ...props }) => (
  <div
    className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg border border-neutral-200 dark:border-gray-700 shadow-sm',
      'p-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={clsx('flex items-center justify-between mb-4', className)}>
    <div>
      <h2 className="text-xl font-bold font-primary text-gray-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={clsx('', className)}>
    {children}
  </div>
);
