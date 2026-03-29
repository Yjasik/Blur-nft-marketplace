const fs = require('fs');
const path = require('path');
const { PinataSDK } = require('pinata');
require('dotenv').config({ path: '.env.local' });

const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_JWT) {
  console.error('❌ PINATA_JWT not found in .env.local');
  process.exit(1);
}

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
});

async function uploadMetadata() {
  console.log('🚀 Uploading metadata to IPFS...\n');
  
  const tokenURIs = {};
  
  for (let i = 1; i <= 10; i++) {
    const filePath = path.join(__dirname, '..', 'metadata', `${i}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  metadata/${i}.json not found, skipping`);
      continue;
    }
    
    const fileContent = fs.readFileSync(filePath);
    const fileName = `yjs-master-${i}.json`;
    
    process.stdout.write(`[${i}/10] Uploading metadata/${i}.json... `);
    
    try {
      // Правильный синтаксис для pinata v2
      const result = await pinata.upload.file(fileContent, {
        name: fileName
      });
      
      const cid = result.cid;
      tokenURIs[i] = `ipfs://${cid}`;
      console.log(`✅ ${cid}`);
    } catch (error) {
      console.log(`❌ ${error.message}`);
    }
    
    // Небольшая задержка
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Сохраняем результат
  fs.writeFileSync('./token-uris.json', JSON.stringify(tokenURIs, null, 2));
  console.log('\n✅ token-uris.json saved!');
  console.log('\n📋 Copy these URIs for minting:');
  console.log(JSON.stringify(tokenURIs, null, 2));
}

uploadMetadata().catch(console.error);
