const { DataTypes } = require('sequelize');
const { isValidDocument } = require('../utils/validators');

module.exports = (sequelize) => {
    const Cliente = sequelize.define('Cliente', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tipo_pessoa: {
            type: DataTypes.ENUM('fisica', 'juridica'),
            allowNull: false,
            defaultValue: 'fisica',
        },
        nome_fantasia: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        razao_social: {
            type: DataTypes.STRING(255),
        },
        cpf_cnpj: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
            validate: {
                customValidator(value) {
                    if (value && !isValidDocument(value)) {
                        throw new Error('CPF ou CNPJ inválido');
                    }
                },
            },
        },
        inscricao_estadual: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        inscricao_municipal: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        responsavel_legal: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        email_financeiro: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        telefone: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        celular: {
            type: DataTypes.STRING(20),
        },
        endereco: {
            type: DataTypes.STRING(500),
        },
        cidade: {
            type: DataTypes.STRING(100),
        },
        estado: {
            type: DataTypes.CHAR(2),
        },
        cep: {
            type: DataTypes.STRING(10),
        },
        observacoes: {
            type: DataTypes.TEXT,
        },
        tabela_preco_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'clientes',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    // Associations
    Cliente.associate = (models) => {
        Cliente.hasMany(models.Demanda, {
            foreignKey: 'cliente_id',
            as: 'demandas',
        });
    };

    return Cliente;
};
