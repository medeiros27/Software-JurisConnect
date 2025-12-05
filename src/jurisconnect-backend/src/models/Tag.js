const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        cor: {
            type: DataTypes.STRING(7),
            allowNull: false,
            defaultValue: '#3B82F6',
            comment: 'Cor em formato hexadecimal #RRGGBB',
        },
        icone: {
            type: DataTypes.STRING(50),
            comment: 'Nome do ícone ou emoji',
        },
        descricao: {
            type: DataTypes.TEXT,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'tags',
        timestamps: true,
        underscored: true,
    });

    Tag.associate = (models) => {
        Tag.belongsToMany(models.Demanda, {
            through: 'demanda_tags',
            foreignKey: 'tag_id',
            otherKey: 'demanda_id',
            as: 'demandas',
        });
    };

    return Tag;
};
