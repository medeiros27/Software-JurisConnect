const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Pagamento = sequelize.define('Pagamento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        numero_fatura: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        tipo: {
            type: DataTypes.ENUM('receber', 'pagar'),
            allowNull: false,
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        data_vencimento: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        data_pagamento: {
            type: DataTypes.DATE,
        },
        status: {
            type: DataTypes.ENUM('pendente', 'pago', 'vencido', 'cancelado'),
            defaultValue: 'pendente',
        },
        forma_pagamento: {
            type: DataTypes.ENUM('dinheiro', 'pix', 'ted', 'boleto', 'cartao'),
        },
        observacoes: {
            type: DataTypes.TEXT,
        },
        demanda_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'demandas',
                key: 'id',
            },
        },
        correspondente_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'correspondentes',
                key: 'id',
            },
        },
    }, {
        tableName: 'pagamentos',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    // Associations
    Pagamento.associate = (models) => {
        Pagamento.belongsTo(models.Demanda, {
            foreignKey: 'demanda_id',
            as: 'demanda',
        });

        Pagamento.belongsTo(models.Correspondente, {
            foreignKey: 'correspondente_id',
            as: 'correspondente',
        });
    };

    return Pagamento;
};
