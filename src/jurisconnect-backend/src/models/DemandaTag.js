const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DemandaTag = sequelize.define('DemandaTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        demanda_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'demandas',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        tag_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tags',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    }, {
        tableName: 'demanda_tags',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['demanda_id', 'tag_id'],
            },
        ],
    });

    return DemandaTag;
};
