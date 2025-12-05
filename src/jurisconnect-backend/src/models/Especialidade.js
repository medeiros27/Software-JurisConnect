const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Especialidade = sequelize.define('Especialidade', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        descricao: {
            type: DataTypes.TEXT,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'especialidades',
        timestamps: true,
        underscored: true,
    });

    Especialidade.associate = (models) => {
        Especialidade.belongsToMany(models.Correspondente, {
            through: 'correspondente_especialidades',
            foreignKey: 'especialidade_id',
            as: 'correspondentes',
        });

        Especialidade.hasMany(models.Demanda, {
            foreignKey: 'especialidade_id',
            as: 'demandas',
        });
    };

    return Especialidade;
};
