// Mock API functions
const MOCK_DELAY = 800;

// Mock user database
const MOCK_USERS = [
  {
    email: 'admin@jurisconnect.com',
    password: 'Senha@123',
    nome: 'João Silva',
    role: 'Administrador',
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%232465a7'/%3E%3Ctext x='50' y='65' font-size='40' fill='white' text-anchor='middle' font-weight='bold'%3EJS%3C/text%3E%3C/svg%3E"
  }
];

// Simulate API delay
function mockDelay() {
  return new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
}

export async function loginAPI(email, password) {
  await mockDelay();

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Email ou senha incorretos');
  }

  // Return user without password
  const { password: _, ...userData } = user;
  return {
    success: true,
    user: userData,
    token: 'mock-jwt-token-' + Date.now()
  };
}

export async function getKPIsAPI() {
  await mockDelay();

  return {
    demandas_ativas: 28,
    receita_mes: 125500,
    correspondentes: 12,
    taxa_cumprimento: 87
  };
}

export async function getReceitasSemanaAPI() {
  await mockDelay();

  return [
    { semana: 'Sem 1', valor: 28500 },
    { semana: 'Sem 2', valor: 32100 },
    { semana: 'Sem 3', valor: 29800 },
    { semana: 'Sem 4', valor: 35100 }
  ];
}

export async function getDemandasStatusAPI() {
  await mockDelay();

  return [
    { status: 'Ativa', quantidade: 28, cor: 'primary' },
    { status: 'Concluída', quantidade: 65, cor: 'success' },
    { status: 'Atrasada', quantidade: 8, cor: 'error' },
    { status: 'Pendente', quantidade: 15, cor: 'warning' }
  ];
}

export async function getDemandasRecentesAPI() {
  await mockDelay();

  return [
    { id: 1, numero: 'DEM-2025-001', cliente: 'Escritório XYZ', especialidade: 'Civil', status: 'Ativa', data: '01/Nov/2025' },
    { id: 2, numero: 'DEM-2025-002', cliente: 'Empresa ABC', especialidade: 'Trabalhista', status: 'Pendente', data: '02/Nov/2025' },
    { id: 3, numero: 'DEM-2025-003', cliente: 'Consultoria DEF', especialidade: 'Tributária', status: 'Concluída', data: '03/Nov/2025' },
    { id: 4, numero: 'DEM-2025-004', cliente: 'Indústria GHI', especialidade: 'Ambiental', status: 'Ativa', data: '04/Nov/2025' },
    { id: 5, numero: 'DEM-2025-005', cliente: 'Comerciante JKL', especialidade: 'Comercial', status: 'Atrasada', data: '05/Nov/2025' }
  ];
}

export async function getNotificacoesAPI() {
  await mockDelay();

  return [
    { id: 1, titulo: 'Nova demanda', mensagem: 'Demanda DEM-2025-006 foi criada', tempo: '5 min' },
    { id: 2, titulo: 'Pagamento confirmado', mensagem: 'Fatura FAT-001 foi paga', tempo: '2 horas' },
    { id: 3, titulo: 'Correspondente online', mensagem: 'João Silva está disponível', tempo: '10 min' }
  ];
}