const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Documento = sequelize.define('Documento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        tipo: {
            type: DataTypes.STRING(50),
        },
        url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        tamanho: {
            type: DataTypes.INTEGER, // em bytes
        },
        mime_type: {
            type: DataTypes.STRING(100),
        },
        criado_por: {
            type: DataTypes.INTEGER,
            references: {
                model: 'usuarios',
                key: 'id',
            },
        },
        demanda_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'demandas',
                key: 'id',
            },
        },
    }, {
        tableName: 'documentos',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Documento.associate = (models) => {
        Documento.belongsTo(models.Demanda, {
            foreignKey: 'demanda_id',
            as: 'demanda',
        });
        Documento.belongsTo(models.Usuario, {
            foreignKey: 'criado_por',
            as: 'criador',
        });
    };

    return Documento;
};
