// Script para criar contas de teste no LashBrow
// Usa a REST API do Firebase Auth + Firestore REST API
const https = require('https');

const API_KEY = 'AIzaSyDu_7cRKPc2rLcukZTsb58yMN-g0IlvIYc';
const PROJECT_ID = 'lashbrow-app';

const ACCOUNTS = [
  {
    email: 'studio@lashbrow.test',
    password: 'LashBrow2024!',
    displayName: 'Mariana Studio',
    plan: 'studio',
    studioName: 'Studio Bella Lash'
  },
  {
    email: 'premium@lashbrow.test',
    password: 'LashBrow2024!',
    displayName: 'Carolina Premium',
    plan: 'premium',
    studioName: 'Premium Lash & Brow'
  }
];

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function httpPost(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { resolve({ rawBody: body }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function httpPatch(url, data, idToken) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);
    const req = https.request({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${idToken}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch(e) { resolve({ rawBody: body, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function createAccount(acc) {
  console.log(`\n${'━'.repeat(50)}`);
  console.log(`  Criando conta: ${acc.plan.toUpperCase()}`);
  console.log(`  E-mail: ${acc.email}`);
  console.log(`  Senha:  ${acc.password}`);
  console.log(`${'━'.repeat(50)}`);

  // 1. Criar usuário via Firebase Auth REST API
  console.log('→ Criando usuário no Firebase Auth...');
  let authResult = await httpPost(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email: acc.email, password: acc.password, returnSecureToken: true }
  );

  let idToken, uid;

  if (authResult.error) {
    if (authResult.error.message === 'EMAIL_EXISTS') {
      console.log('⚠️  Conta já existe. Fazendo login para atualizar...');
      authResult = await httpPost(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        { email: acc.email, password: acc.password, returnSecureToken: true }
      );
      if (authResult.error) {
        console.error('❌ Erro no login:', authResult.error.message);
        return;
      }
    } else {
      console.error('❌ Erro ao criar:', authResult.error.message);
      return;
    }
  }

  idToken = authResult.idToken;
  uid = authResult.localId;
  console.log(`✅ Auth OK! UID: ${uid}`);

  // 2. Atualizar displayName
  console.log('→ Atualizando displayName...');
  await httpPost(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
    { idToken, displayName: acc.displayName, returnSecureToken: false }
  );

  // 3. Criar/Atualizar documento "companies" via Firestore REST API
  console.log('→ Criando documento Firestore (companies)...');
  const companiesUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/companies/${uid}?updateMask.fieldPaths=companyName&updateMask.fieldPaths=ownerName&updateMask.fieldPaths=ownerEmail&updateMask.fieldPaths=plan&updateMask.fieldPaths=selectedPlan&updateMask.fieldPaths=status&updateMask.fieldPaths=subscriptionStatus&updateMask.fieldPaths=referralCode&updateMask.fieldPaths=pixKey&updateMask.fieldPaths=ownerPhone`;

  const companiesData = {
    fields: {
      companyName: { stringValue: acc.studioName },
      ownerName: { stringValue: acc.displayName },
      ownerEmail: { stringValue: acc.email },
      ownerPhone: { stringValue: '' },
      plan: { stringValue: acc.plan },
      selectedPlan: { stringValue: acc.plan },
      status: { stringValue: 'active' },
      subscriptionStatus: { stringValue: 'active' },
      referralCode: { stringValue: generateCode() },
      pixKey: { stringValue: '' }
    }
  };

  const compResult = await httpPatch(companiesUrl, companiesData, idToken);
  if (compResult.error) {
    console.error('❌ Erro Firestore companies:', JSON.stringify(compResult.error));
  } else {
    console.log('✅ Firestore "companies" atualizado!');
  }

  // 4. Criar/Atualizar documento "studios"
  console.log('→ Criando documento Firestore (studios)...');
  const studiosUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/studios/${uid}?updateMask.fieldPaths=studioName&updateMask.fieldPaths=companyName&updateMask.fieldPaths=ownerEmail&updateMask.fieldPaths=plan`;

  const studiosData = {
    fields: {
      studioName: { stringValue: acc.studioName },
      companyName: { stringValue: acc.studioName },
      ownerEmail: { stringValue: acc.email },
      plan: { stringValue: acc.plan }
    }
  };

  const studioResult = await httpPatch(studiosUrl, studiosData, idToken);
  if (studioResult.error) {
    console.error('❌ Erro Firestore studios:', JSON.stringify(studioResult.error));
  } else {
    console.log('✅ Firestore "studios" atualizado!');
  }

  console.log(`\n🎉 Conta ${acc.plan.toUpperCase()} pronta!`);
}

async function main() {
  console.log('✨ LashBrow — Criando Contas de Teste\n');

  for (const acc of ACCOUNTS) {
    await createAccount(acc);
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log('  🎉 RESUMO DAS CONTAS CRIADAS');
  console.log(`${'═'.repeat(50)}`);
  console.log('');
  console.log('  📋 Plano STUDIO:');
  console.log('     E-mail: studio@lashbrow.test');
  console.log('     Senha:  LashBrow2024!');
  console.log('');
  console.log('  📋 Plano PREMIUM:');
  console.log('     E-mail: premium@lashbrow.test');
  console.log('     Senha:  LashBrow2024!');
  console.log('');
  console.log('  🌐 Acesse: https://lashbrow.clientehub.app.br/app.html');
  console.log(`${'═'.repeat(50)}`);
}

main().catch(err => console.error('Erro fatal:', err));
