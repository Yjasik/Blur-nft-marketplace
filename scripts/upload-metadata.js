const fs = require('fs');
const path = require('path');
const { PinataSDK } = require('pinata');

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
});

async function uploadMetadata() {
  console.log('Uploading metadata to IPFS...');
  
  const metadataDir = path.join(__dirname, '../metadata');
  const files = fs.readdirSync(metadataDir);
  const tokenURIs = {};
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(metadataDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const tokenId = parseInt(file.replace('.json', ''));
      
      // Загружаем JSON
      const upload = await pinata.upload.file(fileBuffer);
      tokenURIs[tokenId] = `ipfs://${upload.cid}`;
      
      console.log(`Uploaded ${file} -> ${upload.cid}`);
    }
  }
  
  // Сохраняем URI для использования в скрипте минта
  fs.writeFileSync('./token-uris.json', JSON.stringify(tokenURIs, null, 2));
  console.log('Token URIs saved to token-uris.json');
}

uploadMetadata().catch(console.error);