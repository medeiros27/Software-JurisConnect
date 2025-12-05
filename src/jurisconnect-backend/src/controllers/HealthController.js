const { sequelize } = require('../models');
const os = require('os');

class HealthController {
    async check(req, res) {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now(),
            services: {
                database: {
                    status: 'UNKNOWN',
                    latency: 0
                },
                system: {
                    memoryUsage: process.memoryUsage(),
                    cpuLoad: os.loadavg(),
                    freeMemory: os.freemem(),
                    totalMemory: os.totalmem()
                }
            }
        };

        try {
            const start = Date.now();
            await sequelize.authenticate();
            healthcheck.services.database.latency = Date.now() - start;
            healthcheck.services.database.status = 'UP';

            res.status(200).json(healthcheck);
        } catch (error) {
            healthcheck.message = error.message;
            healthcheck.services.database.status = 'DOWN';
            res.status(503).json(healthcheck);
        }
    }

    async checkDetailed(req, res) {
        // Alias for check, but could be expanded for more sensitive info if needed
        return this.check(req, res);
    }
}

module.exports = new HealthController();
