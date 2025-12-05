const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DemandaCorrespondente = sequelize.define('DemandaCorrespondente', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        status_pagamento: {
            type: DataTypes.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
            defaultValue: 'pendente',
        },
        data_pagamento: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        funcao: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'demanda_correspondentes',
        timestamps: true,
        underscored: true,
    });

    return DemandaCorrespondente;
};
