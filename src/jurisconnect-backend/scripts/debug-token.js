const { Demanda } = require('../src/models');
const { executeWithRetry } = require('../src/utils/dbHelpers');

async function checkToken() {
    const token = '1ccd25eb-3134-41f0-8479-eb8d31c07c90';
    console.log(`Checking for token: ${token}`);

    try {
        const demanda = await Demanda.findOne({
            where: { access_token: token }
        });

        if (demanda) {
            console.log('✅ Found demand:', {
                id: demanda.id,
                numero: demanda.numero,
                status: demanda.status,
                access_token: demanda.access_token
            });
        } else {
            console.log('❌ No demand found with this access_token.');

            // Try to find if this UUID is actually an ID?
            const byId = await Demanda.findByPk(token).catch(() => null);
            if (byId) {
                console.log('⚠️ Wait! This UUID is actually the demand ID, not the token!');
                console.log('Demand found by ID:', {
                    id: byId.id,
                    token: byId.access_token
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkToken();
