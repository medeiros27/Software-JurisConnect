const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Correspondente = sequelize.define('Correspondente', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tipo: {
            type: DataTypes.ENUM('advogado', 'preposto'),
            allowNull: false,
            defaultValue: 'advogado',
        },
        nome_fantasia: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        razao_social: {
            type: DataTypes.STRING(255),
        },
        cpf_cnpj: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        telefone: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        celular: {
            type: DataTypes.STRING(20),
        },
        estado_sediado: {
            type: DataTypes.CHAR(2),
            allowNull: true,
        },
        cidade_sediado: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        cidades_atendidas: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Lista de cidades atendidas separadas por vírgula ou JSON',
        },
        endereco_completo: {
            type: DataTypes.STRING(500),
        },
        cep: {
            type: DataTypes.STRING(10),
        },
        oab_numero: {
            type: DataTypes.STRING(20),
            validate: {
                requiredIfAdvogado(value) {
                    if (this.tipo === 'advogado' && !value) {
                        throw new Error('Número da OAB é obrigatório para advogados');
                    }
                }
            }
        },
        oab_estado: {
            type: DataTypes.CHAR(2),
            validate: {
                requiredIfAdvogado(value) {
                    if (this.tipo === 'advogado' && !value) {
                        throw new Error('Estado da OAB é obrigatório para advogados');
                    }
                }
            }
        },
        classificacao: {
            type: DataTypes.DECIMAL(3, 2),
            defaultValue: 0.00,
            validate: {
                min: 0,
                max: 5,
            },
        },
        taxa_sucesso: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00,
        },
        observacoes: {
            type: DataTypes.TEXT,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'correspondentes',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });

    // Associations
    Correspondente.associate = (models) => {
        Correspondente.hasMany(models.Demanda, {
            foreignKey: 'correspondente_id',
            as: 'demandas',
        });

        Correspondente.belongsToMany(models.Especialidade, {
            through: 'correspondente_especialidades',
            foreignKey: 'correspondente_id',
            as: 'especialidades',
        });

        Correspondente.belongsToMany(models.Demanda, {
            through: models.DemandaCorrespondente,
            foreignKey: 'correspondente_id',
            otherKey: 'demanda_id',
            as: 'demandas_equipe',
        });
    };

    return Correspondente;
};
