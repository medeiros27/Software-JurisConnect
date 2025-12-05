const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'JurisConnect';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const config = {
    apiUrl: API_URL,
    appName: APP_NAME,
    appVersion: APP_VERSION,
    endpoints: {
        auth: {
            login: `${API_URL}/auth/login`,
            logout: `${API_URL}/auth/logout`,
            refresh: `${API_URL}/auth/refresh`,
            me: `${API_URL}/auth/me`,
        },
        clientes: `${API_URL}/clientes`,
        correspondentes: `${API_URL}/correspondentes`,
        demandas: `${API_URL}/demandas`,
        financeiro: `${API_URL}/financeiro`,
        agenda: `${API_URL}/agenda`,
        especialidades: `${API_URL}/especialidades`,
        dashboard: `${API_URL}/dashboard`,
        documentos: `${API_URL}/documentos`,
        notificacoes: `${API_URL}/notificacoes`,
        reports: `${API_URL}/reports`,
        integrations: {
            whatsapp: `${API_URL}/integrations/test/whatsapp`,
            googleCalendar: `${API_URL}/integrations/test/google-calendar`,
            s3: `${API_URL}/integrations/test/s3`,
            viacep: `${API_URL}/integrations/test/viacep`,
            receita: `${API_URL}/integrations/test/receita`,
        },
    },
};

export default config;
