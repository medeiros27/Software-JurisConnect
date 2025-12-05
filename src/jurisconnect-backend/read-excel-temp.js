
const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../backup/Planilha de Diligências - 2025.xlsx');
console.log(`Reading file: ${filePath}`);

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);
    const relevantSheets = ['NOVEMBRO', 'DEZEMBRO'];
    let allItems = [];

    relevantSheets.forEach(sheetName => {
        if (workbook.SheetNames.includes(sheetName)) {
            console.log(`Reading sheet: ${sheetName}`);
            const sheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Find header row (row with 'Data' or similar)
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(20, rawData.length); i++) {
                const row = rawData[i];
                if (row && row.some(cell => cell && typeof cell === 'string' && (cell.includes('Data') || cell.includes('DATA')))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex !== -1) {
                console.log(`Found header at row ${headerRowIndex}`);
                const data = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });
                console.log(`Rows in ${sheetName}: ${data.length}`);
                allItems = allItems.concat(data);
            } else {
                console.log(`No header found in ${sheetName}`);
            }
        }
    });

    console.log(`Total items collected: ${allItems.length}`);

    // Filter for items after 2025-11-27
    const recentItems = allItems.filter(row => {
        // Try to find a date field
        const dateVal = row['Data'] || row['data'] || row['Data da Audiência'] || row['DATA'] || row['DATA DO ATO'];
        if (!dateVal) return false;

        // Excel dates are sometimes numbers, sometimes strings
        let date;
        if (typeof dateVal === 'number') {
            // Excel date to JS date
            date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        } else {
            // Handle DD/MM/YYYY format manually if needed, or rely on Date parse
            if (typeof dateVal === 'string' && dateVal.includes('/')) {
                const parts = dateVal.split('/');
                if (parts.length === 3) {
                    // Assume DD/MM/YYYY
                    date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                } else {
                    date = new Date(dateVal);
                }
            } else {
                date = new Date(dateVal);
            }
        }

        // Check if valid date and after 2025-11-27
        const targetDate = new Date('2025-11-27');
        return date >= targetDate;
    });

    console.log(`Items found after 2025-11-27: ${recentItems.length}`);
    recentItems.forEach(item => {
        console.log(JSON.stringify(item));
    });

} catch (error) {
    console.error('Error reading Excel:', error);
}
