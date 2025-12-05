const { Sequelize } = require('sequelize');
const config = require('../config/database');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        define: dbConfig.define,
        pool: dbConfig.pool,
    }
);

const db = {};

// Importar models
db.Usuario = require('./Usuario')(sequelize);
db.Cliente = require('./Cliente')(sequelize);
db.Correspondente = require('./Correspondente')(sequelize);
db.Especialidade = require('./Especialidade')(sequelize);
db.Demanda = require('./Demanda')(sequelize);
db.Diligencia = require('./Diligencia')(sequelize);
db.Documento = require('./Documento')(sequelize);
db.Pagamento = require('./Pagamento')(sequelize);
db.Agenda = require('./Agenda')(sequelize);
db.Notificacao = require('./Notificacao')(sequelize);
db.Andamento = require('./Andamento')(sequelize);
db.Tag = require('./Tag')(sequelize);
db.DemandaTag = require('./DemandaTag')(sequelize);
db.DemandaCorrespondente = require('./DemandaCorrespondente')(sequelize);

// Executar associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
