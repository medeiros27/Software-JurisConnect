const fs = require('fs');
const path = require('path');
const { Documento, sequelize } = require('../src/models');
const cronService = require('../src/services/cronService');
const logger = require('../src/utils/logger');

async function runTest() {
    console.log('🧪 Starting CronService Cleanup Test...');

    try {
        // 1. Create a dummy file
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `test_cleanup_${Date.now()}.txt`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, 'This is a test file for cleanup.');
        console.log(`✅ Created test file: ${filename}`);

        // 2. Create a dummy database record (older than 30 days)
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 31); // 31 days ago

        const doc = await Documento.create({
            nome: 'Test Cleanup File',
            tipo: 'text/plain',
            url: `/uploads/${filename}`,
            tamanho: 100,
            mime_type: 'text/plain',
            created_at: oldDate,
            updated_at: oldDate
        });

        // Force update created_at because Sequelize might overwrite it on create
        await sequelize.query(
            `UPDATE documentos SET created_at = :date WHERE id = :id`,
            { replacements: { date: oldDate, id: doc.id } }
        );

        console.log(`✅ Created test database record (ID: ${doc.id}) with date: ${oldDate.toISOString()}`);

        // 3. Run cleanup manually
        console.log('🔄 Running cleanupOldFiles()...');
        await cronService.cleanupOldFiles();

        // 4. Verify deletion
        const fileExists = fs.existsSync(filePath);
        const docRecord = await Documento.findByPk(doc.id, { paranoid: false }); // Check if exists (even if soft deleted)

        // Check if soft deleted (deleted_at should be not null)
        const isSoftDeleted = docRecord && docRecord.deleted_at !== null;

        console.log('--- Results ---');
        console.log(`File exists on disk? ${fileExists ? '❌ YES (Failed)' : '✅ NO (Success)'}`);
        console.log(`Record soft deleted in DB? ${isSoftDeleted ? '✅ YES (Success)' : '❌ NO (Failed)'}`);

        if (!fileExists && isSoftDeleted) {
            console.log('🎉 Test PASSED!');
        } else {
            console.error('💥 Test FAILED!');
        }

    } catch (error) {
        console.error('❌ Test Error:', error);
    } finally {
        await sequelize.close();
    }
}

runTest();
