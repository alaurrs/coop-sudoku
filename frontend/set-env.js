const fs = require('fs');
const path = require('path');

const dir = './src/environments';
const fileName = 'environment.prod.ts';
const filePath = path.join(dir, fileName);

// Valeurs par défaut ou variables d'env Digital Ocean
const apiUrl = process.env.API_URL || 'https://api.sudoku.sallyvnge.fr/api';
let wsUrl = process.env.WS_URL || 'wss://api.sudoku.sallyvnge.fr/ws-sudoku';

// S'assurer que l'URL WS commence par wss ou ws si c'est une URL absolue
if (wsUrl.startsWith('http')) {
  wsUrl = wsUrl.replace(/^http/, 'ws');
}

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