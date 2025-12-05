const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Connect to 'jurisconnect' database
const sequelize = new Sequelize('jurisconnect', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('admin', 'gestor', 'operador') } // Assuming same schema
}, { tableName: 'usuarios', timestamps: false, underscored: true });

async function checkUsers() {
    try {
        const users = await Usuario.findAll({ attributes: ['id', 'nome', 'email', 'role'] });
        console.log('--- USERS IN JURISCONNECT DB ---');
        for (const u of users) {
            console.log(`USER: ${u.id} - ${u.nome} (${u.email}) - Role: ${u.role}`);
        }
        console.log('--------------------------------');
    } catch (error) {
        console.error('Error checking users in jurisconnect DB:', error);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
