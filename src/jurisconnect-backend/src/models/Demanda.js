const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Demanda = sequelize.define('Demanda', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        numero: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        access_token: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        processo: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        descricao: {
            type: DataTypes.TEXT,
        },
        tipo_demanda: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'rascunho',
                'pendente',
                'em_andamento',
                'aguardando_correspondente',
                'concluida',
                'cancelada'
            ),
            defaultValue: 'rascunho',
        },
        prioridade: {
            type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
            defaultValue: 'media',
        },
        data_prazo: {
            type: DataTypes.DATE,
        },
        data_agendamento: {
            type: DataTypes.DATE,
        },
        data_inicio: {
            type: DataTypes.DATE,
        },
        data_conclusao: {
            type: DataTypes.DATE,
        },
        valor_estimado: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        valor_cobrado: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        valor_custo: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        cidade: {
            type: DataTypes.STRING(100),
        },
        estado: {
            type: DataTypes.CHAR(2),
        },
        local: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        observacoes: {
            type: DataTypes.TEXT,
        },
        status_pagamento_cliente: {
            type: DataTypes.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
            defaultValue: 'pendente'
        },
        status_pagamento_correspondente: {
            type: DataTypes.ENUM('pendente', 'pago', 'atrasado', 'cancelado'),
            defaultValue: 'pendente'
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'clientes',
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
        especialidade_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'especialidades',
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
        tableName: 'demandas',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    // Associations
    Demanda.associate = (models) => {
        Demanda.belongsTo(models.Cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
        });

        Demanda.belongsTo(models.Correspondente, {
            foreignKey: 'correspondente_id',
            as: 'correspondente',
        });

        Demanda.belongsTo(models.Especialidade, {
            foreignKey: 'especialidade_id',
            as: 'especialidade',
        });

        Demanda.belongsTo(models.Usuario, {
            foreignKey: 'criado_por',
            as: 'criador',
        });

        Demanda.hasMany(models.Diligencia, {
            foreignKey: 'demanda_id',
            as: 'diligencias',
        });

        Demanda.hasMany(models.Documento, {
            foreignKey: 'demanda_id',
            as: 'documentos',
        });

        Demanda.hasMany(models.Pagamento, {
            foreignKey: 'demanda_id',
            as: 'pagamentos',
        });

        Demanda.hasMany(models.Andamento, {
            foreignKey: 'demanda_id',
            as: 'andamentos',
        });

        Demanda.belongsToMany(models.Tag, {
            through: 'demanda_tags',
            foreignKey: 'demanda_id',
            otherKey: 'tag_id',
            as: 'tags',
        });

        Demanda.belongsToMany(models.Correspondente, {
            through: models.DemandaCorrespondente,
            foreignKey: 'demanda_id',
            otherKey: 'correspondente_id',
            as: 'equipe',
        });
    };

    return Demanda;
};
