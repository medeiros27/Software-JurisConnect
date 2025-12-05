const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const Usuario = sequelize.define('Usuario', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        supabase_uuid: {
            type: DataTypes.UUID,
            allowNull: true,
            unique: true,
        },
        nome: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                len: [3, 150],
            },
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        senha_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'gestor', 'operador'),
            defaultValue: 'operador',
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        ultimo_login: {
            type: DataTypes.DATE,
        },
        refresh_token: {
            type: DataTypes.TEXT,
        },
        google_access_token: {
            type: DataTypes.TEXT,
        },
        google_refresh_token: {
            type: DataTypes.TEXT,
        },
    }, {
        tableName: 'usuarios',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (usuario) => {
                if (usuario.senha_hash) {
                    usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);
                }
            },
            beforeUpdate: async (usuario) => {
                if (usuario.changed('senha_hash')) {
                    usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);
                }
            },
        },
    });

    // Métodos de instância
    Usuario.prototype.validarSenha = async function (senha) {
        return bcrypt.compare(senha, this.senha_hash);
    };

    Usuario.prototype.toJSON = function () {
        const values = { ...this.get() };
        delete values.senha_hash;
        delete values.refresh_token;
        return values;
    };

    // Associations
    Usuario.associate = (models) => {
        Usuario.hasMany(models.Demanda, {
            foreignKey: 'criado_por',
            as: 'demandas_criadas',
        });
    };

    return Usuario;
};
