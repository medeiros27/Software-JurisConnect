const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Agenda = sequelize.define('Agenda', {
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
        tipo: {
            type: DataTypes.ENUM('prazo', 'audiencia', 'reuniao', 'lembrete', 'outro'),
            allowNull: false,
        },
        data_evento: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        hora_evento: {
            type: DataTypes.TIME,
        },
        duracao_minutos: {
            type: DataTypes.INTEGER,
            defaultValue: 60,
        },
        local: {
            type: DataTypes.STRING(500),
        },
        alerta_dias_antes: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        demanda_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'demandas',
                key: 'id',
            },
        },
        criado_por: {
            type: DataTypes.INTEGER,
            references: {
                model: 'usuarios',
                key: 'id',
            },
        },
    }, {
        tableName: 'agenda',
        timestamps: true,
        underscored: true,
    });

    // Associations
    Agenda.associate = (models) => {
        Agenda.belongsTo(models.Demanda, {
            foreignKey: 'demanda_id',
            as: 'demanda',
        });

        Agenda.belongsTo(models.Usuario, {
            foreignKey: 'criado_por',
            as: 'criador',
        });
    };

    return Agenda;
};
