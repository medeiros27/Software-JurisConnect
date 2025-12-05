const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Andamento = sequelize.define('Andamento', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tipo: {
            type: DataTypes.ENUM(
                'criacao',
                'atualizacao',
                'mudanca_status',
                'comentario',
                'documento_adicionado',
                'documento_removido',
                'pagamento',
                'outro'
            ),
            allowNull: false,
            defaultValue: 'outro',
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        descricao: {
            type: DataTypes.TEXT,
        },
        dados_anteriores: {
            type: DataTypes.JSONB,
            comment: 'Dados antes da mudança (para auditoria)',
        },
        dados_novos: {
            type: DataTypes.JSONB,
            comment: 'Dados após a mudança (para auditoria)',
        },
        visivel_cliente: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Se o andamento deve ser visível para o cliente',
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
        criado_por: {
            type: DataTypes.INTEGER,
            references: {
                model: 'usuarios',
                key: 'id',
            },
        },
    }, {
        tableName: 'andamentos',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    Andamento.associate = (models) => {
        Andamento.belongsTo(models.Demanda, {
            foreignKey: 'demanda_id',
            as: 'demanda',
        });

        Andamento.belongsTo(models.Usuario, {
            foreignKey: 'criado_por',
            as: 'criador',
        });
    };

    return Andamento;
};
