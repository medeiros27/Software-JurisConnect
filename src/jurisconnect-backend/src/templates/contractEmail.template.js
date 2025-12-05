const fs = require('fs');
const path = require('path');

// Caminho relativo do template para o logo
const logoPath = path.join(__dirname, '../../../jurisconnect-frontend/public/logotipo.jpg');

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

const formatDateTime = (date) => {
    if (!date) return 'Não definido';
    return new Date(date).toLocaleString('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short'
    });
};

// Função para converter logo para base64
const getLogoBase64 = () => {
    try {
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
        console.warn('[Email Template] Logo não encontrado, usando fallback');
        // Retorna uma imagem vazia se não encontrar o logo
        return '';
    }
};

const contractEmailTemplate = (demanda) => {
    const {
        numero,
        tipo_demanda,
        titulo,
        descricao,
        processo,
        cidade,
        estado,
        local,
        data_agendamento,
        valor_custo,
        correspondente
    } = demanda;

    const logoBase64 = getLogoBase64();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formalização de Contrato - JurisConnect</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            text-align: center;
        }
        .header img {
            max-width: 180px;
            height: auto;
            margin-bottom: 10px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .header h1 {
            margin: 10px 0 5px 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.95;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .info-section {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-section h2 {
            color: #667eea;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .info-item {
            margin: 10px 0;
            display: flex;
        }
        .info-label {
            font-weight: 600;
            color: #555;
            min-width: 140px;
        }
        .info-value {
            color: #333;
        }
        .value-highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
            font-size: 18px;
            font-weight: 600;
            color: #856404;
        }
        .instructions {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .instructions h3 {
            color: #007bff;
            margin-top: 0;
            font-size: 16px;
        }
        .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .instructions li {
            margin: 8px 0;
        }
        .urgent {
            background-color: #fff5f5;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .urgent strong {
            color: #dc3545;
        }
        .contact-box {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .contact-box h3 {
            color: #155724;
            margin-top: 0;
            font-size: 16px;
        }
        .contact-box p {
            margin: 5px 0;
            color: #155724;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header {
                padding: 20px;
            }
            .content {
                padding: 20px;
            }
            .info-item {
                flex-direction: column;
            }
            .info-label {
                min-width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${logoBase64 ? `<img src="${logoBase64}" alt="JurisConnect">` : ''}
            <h1>Formalização de Contrato</h1>
            <p>JurisConnect - Sistema de Gestão de Correspondentes</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Olá, <strong>${correspondente?.nome_fantasia || 'Correspondente'}</strong>!
            </div>
            
            <p>Segue abaixo as informações da diligência solicitada:</p>
            
            <div class="info-section">
                <h2>📄 Informações da Diligência</h2>
                <div class="info-item">
                    <span class="info-label">Protocolo:</span>
                    <span class="info-value"><strong>${numero}</strong></span>
                </div>
                <div class="info-item">
                    <span class="info-label">Tipo:</span>
                    <span class="info-value">${tipo_demanda}</span>
                </div>
                ${titulo ? `
                <div class="info-item">
                    <span class="info-label">Título:</span>
                    <span class="info-value">${titulo}</span>
                </div>
                ` : ''}
                ${processo ? `
                <div class="info-item">
                    <span class="info-label">Processo:</span>
                    <span class="info-value">${processo}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <span class="info-label">Descrição:</span>
                    <span class="info-value">${descricao || 'Não informada'}</span>
                </div>
            </div>

            <div class="info-section">
                <h2>📍 Local e Data</h2>
                <div class="info-item">
                    <span class="info-label">Cidade/Estado:</span>
                    <span class="info-value">${cidade || ''}/${estado || ''}</span>
                </div>
                ${local ? `
                <div class="info-item">
                    <span class="info-label">Local específico:</span>
                    <span class="info-value">${local}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <span class="info-label">Data/Hora:</span>
                    <span class="info-value">${formatDateTime(data_agendamento)}</span>
                </div>
            </div>

            <div class="value-highlight">
                💰 Valor dos Honorários: ${formatCurrency(valor_custo)}
            </div>

            <div class="urgent">
                <strong>⏰ PRAZO DE RESPOSTA:</strong> Solicitamos confirmação de aceite em até <strong>2 horas</strong>.
            </div>

            <div class="instructions">
                <h3>📝 Instruções e Orientações</h3>
                <ul>
                    <li>✅ Enviar comprovante de execução (fotos/vídeos quando aplicável)</li>
                    <li>💳 Pagamento será realizado em até <strong>5 dias úteis</strong> após a conclusão</li>
                    <li>📱 Comprovante de pagamento será enviado via WhatsApp</li>
                    <li>⚠️ Informar imediatamente qualquer impedimento</li>
                    <li>🔒 Manter sigilo profissional</li>
                    <li>🆔 Usar identificação adequada quando necessário</li>
                </ul>
            </div>

            <div class="contact-box">
                <h3>📞 Contato para Dúvidas</h3>
                <p><strong>WhatsApp:</strong> (11) 93011-9867</p>
                <p><strong>E-mail:</strong> contato@jurisconnect.com.br</p>
            </div>

            <p>Agradecemos sua parceria e aguardamos seu retorno.</p>
            <p><strong>Atenciosamente,</strong><br>Equipe JurisConnect</p>
        </div>
        
        <div class="footer">
            <p><strong>JurisConnect</strong></p>
            <p>Sistema de Gestão de Correspondentes Jurídicos</p>
            <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

module.exports = { contractEmailTemplate };
