const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notificacao = sequelize.define('Notificacao', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        titulo: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        mensagem: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lida: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'usuarios',
                key: 'id',
            },
        },
    }, {
        tableName: 'notificacoes',
        timestamps: true,
        underscored: true,
    });

    Notificacao.associate = (models) => {
        Notificacao.belongsTo(models.Usuario, {
            foreignKey: 'usuario_id',
            as: 'usuario',
        });
    };

    return Notificacao;
};
