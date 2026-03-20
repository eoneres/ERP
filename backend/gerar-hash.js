const bcrypt = require('bcrypt');

async function gerar() {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Hash gerado:', hash);
}

gerar();