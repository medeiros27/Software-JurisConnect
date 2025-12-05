const demandaService = require('../services/demandaService');
const correspondenteDinamicoService = require('../services/correspondenteDinamicoService');
const { Demanda, Cliente, Correspondente } = require('../models'); // Keep models for _dispararWebhook if needed, or refactor webhook to service
const AppError = require('../utils/AppError');
const axios = require('axios');

class DemandaController {
    constructor() {
        this.criar = this.criar.bind(this);
        this.atualizar = this.atualizar.bind(this);
        this.atualizarStatus = this.atualizarStatus.bind(this);
        this.revokeToken = this.revokeToken.bind(this);
    }

    // Método auxiliar para disparar webhook
    async _dispararWebhook(acao, demanda, usuarioId) {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) return;

        try {
            // Busca dados completos para enviar
            const demandaCompleta = await Demanda.findByPk(demanda.id, {
                include: [
                    { association: 'cliente', attributes: ['nome_fantasia', 'email'] },
                    { association: 'correspondente', attributes: ['nome_fantasia', 'email'] }
                ]
            });

            await axios.post(webhookUrl, {
                acao, // 'criada', 'atualizada', 'status_alterado'
                timestamp: new Date(),
                usuario_responsavel: usuarioId,
                demanda: demandaCompleta
            });
        } catch (error) {
            console.error('Erro ao disparar webhook n8n:', error.message);
            // Não falha a requisição principal se o webhook falhar
        }
    }

    async criar(req, res, next) {
        try {
            const demanda = await demandaService.create(req.body, req.usuarioId);

            // Disparar Webhook
            this._dispararWebhook('criada', demanda, req.usuarioId);

            res.status(201).json({
                success: true,
                message: 'Demanda criada com sucesso',
                data: demanda,
            });
        } catch (error) {
            next(error);
        }
    }

    async listar(req, res, next) {
        try {
            console.log('[DemandaController.listar] Received query params:', JSON.stringify(req.query, null, 2));
            const result = await demandaService.list(req.query, req.query);
            console.log('[DemandaController.listar] Returning', result.demandas?.length || 0, 'demandas');
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            console.error('[DemandaController.listar] Error:', error.message);
            next(error);
        }
    }

    async obter(req, res, next) {
        try {
            const demanda = await demandaService.getById(req.params.id);
            if (demanda && demanda.equipe) {
                console.log('[DemandaController] Equipe loaded:', JSON.stringify(demanda.equipe.map(m => ({
                    id: m.id,
                    junction: m.demanda_correspondentes || m.DemandaCorrespondentes
                })), null, 2));
            }
            res.json({
                success: true,
                data: demanda,
            });
        } catch (error) {
            next(error);
        }
    }

    async atualizar(req, res, next) {
        try {
            const demanda = await demandaService.update(req.params.id, req.body, req.usuarioId);

            // Disparar Webhook
            this._dispararWebhook('atualizada', demanda, req.usuarioId);

            res.json({
                success: true,
                message: 'Demanda atualizada com sucesso',
                data: demanda,
            });
        } catch (error) {
            console.error('[DemandaController] Erro ao atualizar:', error);
            if (error.details) console.error('[DemandaController] Validation Details:', JSON.stringify(error.details, null, 2));
            next(error);
        }
    }

    async atualizarStatus(req, res, next) {
        try {
            const demanda = await demandaService.changeStatus(req.params.id, req.body.status, req.usuarioId);

            // Disparar Webhook
            this._dispararWebhook('status_alterado', demanda, req.usuarioId);

            res.json({
                success: true,
                message: 'Status atualizado com sucesso',
                data: demanda,
            });
        } catch (error) {
            next(error);
        }
    }

    async revokeToken(req, res, next) {
        try {
            const result = await demandaService.revokeAccess(req.params.id, req.usuarioId);
            res.json({
                success: true,
                message: 'Acesso revogado e novo token gerado com sucesso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async uploadArquivo(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
            }

            const documento = await demandaService.addDocumento(
                req.params.id,
                req.file,
                req.usuarioId
            );

            res.status(201).json({
                success: true,
                message: 'Arquivo enviado com sucesso',
                data: documento
            });
        } catch (error) {
            next(error);
        }
    }

    async deletar(req, res, next) {
        try {
            const result = await demandaService.delete(req.params.id, req.usuarioId);
            res.json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async estatisticas(req, res, next) {
        try {
            const stats = await demandaService.getStatistics();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // Endpoint específico para o n8n atuar sobre a demanda
    async n8nAction(req, res, next) {
        try {
            const { id } = req.params;
            const { action, payload } = req.body;

            if (action === 'update_status' && payload && payload.status) {
                const demanda = await demandaService.changeStatus(id, payload.status, 'n8n-bot');
                return res.json({ success: true, message: 'Status atualizado via n8n', data: demanda });
            }

            return res.status(400).json({ success: false, message: 'Ação não reconhecida ou payload inválido' });
        } catch (error) {
            next(error);
        }
    }

    // Andamentos
    async adicionarAndamento(req, res, next) {
        try {
            const andamento = await demandaService.addAndamento(
                req.params.id,
                req.body,
                req.usuarioId
            );
            res.status(201).json({
                success: true,
                message: 'Andamento adicionado com sucesso',
                data: andamento,
            });
        } catch (error) {
            next(error);
        }
    }

    async listarAndamentos(req, res, next) {
        try {
            const andamentos = await demandaService.getAndamentos(req.params.id);
            res.json({
                success: true,
                data: andamentos,
            });
        } catch (error) {
            next(error);
        }
    }

    // Tags
    async adicionarTags(req, res, next) {
        try {
            const demanda = await demandaService.addTags(
                req.params.id,
                req.body.tag_ids,
                req.usuarioId
            );
            res.json({
                success: true,
                message: 'Tags adicionadas com sucesso',
                data: demanda,
            });
        } catch (error) {
            next(error);
        }
    }

    async removerTags(req, res, next) {
        try {
            const demanda = await demandaService.removeTags(
                req.params.id,
                req.body.tag_ids,
                req.usuarioId
            );
            res.json({
                success: true,
                message: 'Tags removidas com sucesso',
                data: demanda,
            });
        } catch (error) {
            next(error);
        }
    }

    // Bulk Operations
    async atualizarEmLote(req, res, next) {
        try {
            const result = await demandaService.bulkUpdate(
                req.body.ids,
                req.body.update_data,
                req.usuarioId
            );
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async deletarEmLote(req, res, next) {
        try {
            const result = await demandaService.bulkDelete(
                req.body.ids,
                req.usuarioId
            );
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Export
    async exportarCSV(req, res, next) {
        try {
            const csv = await demandaService.exportToCSV(req.query);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename=demandas.csv');
            res.send('\uFEFF' + csv); // BOM para UTF-8
        } catch (error) {
            next(error);
        }
    }

    // KPIs Dashboard
    async obterKanban(req, res, next) {
        try {
            // Keeping original implementation logic but wrapped in try-catch for consistency
            // Ideally this should also move to service, but for now we keep it here or use getByStatus
            // Let's use the service's getByStatus for each status to build the kanban

            const [pendente, emAndamento, aguardando] = await Promise.all([
                demandaService.getByStatus('pendente'),
                demandaService.getByStatus('em_andamento'),
                demandaService.getByStatus('aguardando_correspondente')
            ]);

            res.json({
                success: true,
                data: {
                    pendente,
                    em_andamento: emAndamento,
                    aguardando_correspondente: aguardando
                },
            });
        } catch (error) {
            next(error);
        }
    }
    async getExternalCities(req, res, next) {
        try {
            const { search } = req.query;
            if (!search) {
                return res.status(400).json({ message: 'Termo de busca é obrigatório' });
            }
            const cities = await correspondenteDinamicoService.searchCities(search);
            res.json({ success: true, data: cities });
        } catch (error) {
            next(error);
        }
    }

    async publishDemand(req, res, next) {
        try {
            const { id } = req.params;
            const demandData = req.body;

            // TODO: Validate demandData against external API requirements
            // TODO: Fetch demand details if not provided in body

            const result = await correspondenteDinamicoService.createDemand(demandData);

            // Update local demand status or store external ID if needed
            // await Demanda.update({ external_id: result.data.external_id, status: 'publicada' }, { where: { id } });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async enviarContrato(req, res, next) {
        try {
            const emailService = require('../services/email.service');
            const demanda = await demandaService.getById(req.params.id);

            if (!demanda) {
                throw AppError.notFound('Demanda não encontrada');
            }

            await emailService.sendContractEmail(demanda);

            res.json({
                success: true,
                message: 'E-mail de contrato enviado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DemandaController();

