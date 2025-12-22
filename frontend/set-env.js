const fs = require('fs');
const path = require('path');

const dir = './src/environments';
const fileName = 'environment.prod.ts';
const filePath = path.join(dir, fileName);

// Valeurs par défaut ou variables d'env Digital Ocean
const apiUrl = process.env.API_URL || 'https://api.sudoku.sallyvnge.fr/api';
// Force ws://api.sudoku.sallyvnge.fr/ws-sudoku without extra /api if the var is wrong
let wsUrl = process.env.WS_URL || 'wss://api.sudoku.sallyvnge.fr/ws-sudoku';

// Correction auto : si l'URL contient double /api/api, on nettoie
wsUrl = wsUrl.replace('/api/api/', '/api/');

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  wsUrl: '${wsUrl}'
};
`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(filePath, content);
console.log(`Generated ${fileName} with API_URL: ${apiUrl} and WS_URL: ${wsUrl}`);
