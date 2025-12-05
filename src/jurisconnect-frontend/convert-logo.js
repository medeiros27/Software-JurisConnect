const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../../public/logotipo.jpg');
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = logoBuffer.toString('base64');

console.log('Logo Base64:');
console.log(`data:image/jpeg;base64,${logoBase64}`);
