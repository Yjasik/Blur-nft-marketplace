const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

let envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const PINATA_JWT = process.env.PINATA_JWT;

async function uploadJSON(jsonData, name) {
  const payload = {
    pinataContent: jsonData,
    pinataMetadata: {
      name: name
    },
    pinataOptions: {
      cidVersion: 1
    }
  };
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PINATA_JWT}`
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  const data = await response.json();
  return data.IpfsHash;
}

async function uploadMetadata() {
  console.log('🚀 Uploading metadata to IPFS...');
  
  const metadataDir = path.join(__dirname, '../metadata');
  if (!fs.existsSync(metadataDir)) {
    console.error(`❌ Metadata directory not found: ${metadataDir}`);
    return;
  }
  
  const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'));
  console.log(`📄 Found ${files.length} metadata files`);
  
  const tokenURIs = {};
  let successCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(metadataDir, file);
    const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const tokenId = parseInt(file.replace('.json', ''));
    
    process.stdout.write(`[${i + 1}/${files.length}] Uploading ${file}... `);
    
    try {
      const cid = await uploadJSON(jsonContent, `yjs-master-${tokenId}.json`);
      tokenURIs[tokenId] = `ipfs://${cid}`;
      console.log(`✅ ${cid}`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  fs.writeFileSync('./token-uris.json', JSON.stringify(tokenURIs, null, 2));
  console.log('\n' + '='.repeat(50));
  console.log('📊 UPLOAD COMPLETED');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${successCount} metadata files`);
  console.log(`📁 Token URIs saved to token-uris.json`);
}

uploadMetadata().catch(console.error);
