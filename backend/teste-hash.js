const bcrypt = require('bcrypt');

async function testar() {
    const hash = '$2b$10$fxj02CTyT2bEPeo7jj/44.Hx7Q.JMVLqQvRNLqiR.PbsjKAbkp5oa';
    const senhaTeste = 'admin123';

    console.log('🔐 Testando senha...');
    const resultado = await bcrypt.compare(senhaTeste, hash);
    console.log('✅ Senha válida?', resultado);

    if (!resultado) {
        console.log('❌ A senha "admin123" NÃO corresponde a este hash');
    } else {
        console.log('🎉 A senha "admin123" corresponde ao hash!');
    }
}

testar();