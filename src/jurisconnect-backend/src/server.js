require('express-async-errors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Validate environment configuration BEFORE anything else (fail-fast)
const config = require('./config');

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const HealthController = require('./controllers/HealthController');

// Rotas
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const correspondenteRoutes = require('./routes/correspondente.routes');
const demandaRoutes = require('./routes/demanda.routes');
const financeiroRoutes = require('./routes/financeiro.routes');
const agendaRoutes = require('./routes/agenda.routes');
const especialidadeRoutes = require('./routes/especialidade.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const documentoRoutes = require('./routes/documento.routes');
const notificacaoRoutes = require('./routes/notificacao.routes');
const reportRoutes = require('./routes/reportRoutes');
const tagRoutes = require('./routes/tag.routes');
const backupRoutes = require('./routes/backup.routes');
const processoRoutes = require('./routes/processo.routes');

// Logging
if (config.env === 'development') {
    app.use(morgan('dev'));
}

// Security middlewares
app.set('trust proxy', 1); // Trust Cloudflare proxy

// DEBUG: Spy Middleware to log Android Requests
const fs = require('fs');
app.use((req, res, next) => {
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.url} | Origin: ${req.headers.origin} | User-Agent: ${req.headers['user-agent']}\n`;
    console.log(logLine.trim());
    fs.appendFileSync('android-debug.log', logLine);
    next();
});

// DEBUG: Manual OPTIONS handler to force-fix Cloudflare 404s
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        console.log('⚡ MANUAL OPTIONS HIT:', req.url);
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        return res.status(200).send();
    }
    next();
});

app.use(helmet());
// Parse CORS origins from env or default to allow all in development
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,https://app.jurisconnect.com.br').split(',');

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        if (
            // Exact match in whitelist
            allowedOrigins.indexOf(origin) !== -1 ||
            // Development mode
            process.env.NODE_ENV === 'development' ||
            // Any localhost port (for dev flexibility)
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:') ||
            // Android/Capacitor Origins
            origin === 'http://localhost' ||
            origin === 'capacitor://localhost' ||
            // Production domain and subdomains
            origin.endsWith('.jurisconnect.com.br') ||
            origin === 'https://jurisconnect.com.br'
        ) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Bloqueado: ${origin}`);
            callback(new Error('Bloqueado pelo CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Enable Pre-Flight for all routes using the SAME options
app.options('*', cors(corsOptions));


app.use(compression());

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => HealthController.check(req, res));
app.get('/health/details', (req, res) => HealthController.checkDetailed(req, res));

// API Routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/clientes`, clienteRoutes);
app.use(`${apiPrefix}/correspondentes`, correspondenteRoutes);
app.use(`${apiPrefix}/demandas`, demandaRoutes);
app.use(`${apiPrefix}/financeiro`, financeiroRoutes);
app.use(`${apiPrefix}/agenda`, agendaRoutes);
app.use(`${apiPrefix}/especialidades`, especialidadeRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/documentos`, documentoRoutes);
app.use(`${apiPrefix}/notificacoes`, notificacaoRoutes);
app.use(`${apiPrefix}/reports`, reportRoutes);
app.use(`${apiPrefix}/tags`, tagRoutes);
app.use(`${apiPrefix}/backup`, backupRoutes);
app.use(`${apiPrefix}/processos`, processoRoutes);
app.use(`${apiPrefix}/integrations`, require('./routes/integration.routes'));
app.use(`${apiPrefix}/publico`, require('./routes/publico.routes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.path,
    });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Start server
const PORT = config.port;

// Jobs
const { initDeadlineJob } = require('./jobs/deadlineReminder.job');
const { initReminderJob } = require('./jobs/reminder.job');
const cronService = require('./services/cronService');

app.listen(PORT, () => {
    logger.info(`🚀 Servidor iniciado na porta ${PORT}`);
    logger.info(`📝 Ambiente: ${config.env}`);
    logger.info(`🔗 API: http://localhost:${PORT}${apiPrefix}`);

    // Initialize Jobs
    initDeadlineJob();
    initReminderJob();
    cronService.init();
});

module.exports = app;
