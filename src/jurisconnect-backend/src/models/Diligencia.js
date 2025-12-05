const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Diligencia = sequelize.define('Diligencia', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        descricao: {
            type: DataTypes.TEXT,
        },
        status: {
            type: DataTypes.ENUM('pendente', 'em_andamento', 'concluida', 'cancelada'),
            defaultValue: 'pendente',
        },
        data_limite: {
            type: DataTypes.DATE,
        },
        demanda_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'demandas',
                key: 'id',
            },
        },
    }, {
        tableName: 'diligencias',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Diligencia.associate = (models) => {
        Diligencia.belongsTo(models.Demanda, {
            foreignKey: 'demanda_id',
            as: 'demanda',
        });
    };

    return Diligencia;
};
