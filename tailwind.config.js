// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // Primária: Azul profissional jurídico
      'primary': {
        50: '#f0f7ff',
        100: '#e0efff',
        200: '#bae0ff',
        300: '#7cc5ff',
        400: '#36abff',
        500: '#0084ff',  // Principal
        600: '#0066ff',
        700: '#004dd9',
        800: '#003fa6',
        900: '#002d73',
      },
      
      // Secundária: Verde de sucesso
      'success': {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#16a34a',
        600: '#15803d',
      },
      
      // Aviso
      'warning': {
        50: '#fef3c7',
        500: '#f59e0b',
        600: '#d97706',
      },
      
      // Erro
      'error': {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
      },
      
      // Neutro (cinza)
      'neutral': {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    },
    fontSize: {
      'xs': ['12px', '16px'],
      'sm': ['14px', '20px'],
      'base': ['16px', '24px'],
      'lg': ['18px', '28px'],
      'xl': ['20px', '28px'],
      '2xl': ['24px', '32px'],
    },
    borderRadius: {
      'none': '0',
      'sm': '4px',
      'base': '6px',
      'md': '8px',
      'lg': '12px',
      'xl': '16px',
      'full': '9999px',
    },
  },
}
