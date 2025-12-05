const { google } = require('googleapis');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

class GoogleCalendarService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    generateAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar']
        });
    }

    async getTokens(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            return tokens;
        } catch (error) {
            logger.error(`[GoogleCalendar] Erro ao obter tokens: ${error.message}`);
            throw new AppError('Falha na autenticação com Google', 400);
        }
    }

    async createEvent(authTokens, eventData) {
        try {
            this.oauth2Client.setCredentials(authTokens);
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            const event = {
                summary: eventData.summary,
                description: eventData.description,
                start: { dateTime: eventData.start },
                end: { dateTime: eventData.end },
            };

            const response = await calendar.events.insert({
                calendarId: 'primary',
                resource: event,
            });

            logger.info(`[GoogleCalendar] Evento criado: ${response.data.htmlLink}`);
            return response.data;
        } catch (error) {
            logger.error(`[GoogleCalendar] Erro ao criar evento: ${error.message}`);
            // Não lança erro para não bloquear o fluxo principal, apenas loga
            return null;
        }
    }

    async listEvents(authTokens, start, end) {
        try {
            this.oauth2Client.setCredentials(authTokens);
            const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: start ? start.toISOString() : (new Date()).toISOString(),
                timeMax: end ? end.toISOString() : undefined,
                maxResults: 50,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return response.data.items;
        } catch (error) {
            logger.error(`[GoogleCalendar] Erro ao listar eventos: ${error.message}`);
            return [];
        }
    }
}

module.exports = new GoogleCalendarService();
