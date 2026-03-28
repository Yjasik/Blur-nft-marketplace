const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

let envPath = path.join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

const PINATA_JWT = process.env.PINATA_JWT;

async function uploadImageAsBase64(filePath, fileName) {
  // Читаем файл и конвертируем в base64
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString('base64');
  const mimeType = 'image/png';
  const dataUrl = `data:${mimeType};base64,${base64}`;
  
  const payload = {
    pinataContent: dataUrl,
    pinataMetadata: {
      name: fileName
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

async function uploadImages() {
  console.log('🚀 Starting upload to IPFS via Pinata...');
  
  const imagesDir = path.join(__dirname, '../nft-images');
  
  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Images directory not found: ${imagesDir}`);
    console.log('Please run generate-images.js first');
    return;
  }
  
  const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
  console.log(`📸 Found ${files.length} image files`);
  
  if (files.length === 0) {
    console.error('No images found in nft-images/');
    return;
  }
  
  const imageCids = {};
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(imagesDir, file);
    const tokenId = parseInt(file.replace('.png', ''));
    
    process.stdout.write(`[${i + 1}/${files.length}] Uploading ${file}... `);
    
    try {
      const cid = await uploadImageAsBase64(filePath, `yjs-master-${tokenId}.png`);
      imageCids[tokenId] = cid;
      console.log(`✅ ${cid}`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${error.message}`);
      failCount++;
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Сохраняем CID изображений
  fs.writeFileSync('./image-cids.json', JSON.stringify(imageCids, null, 2));
  console.log('\n' + '='.repeat(50));
  console.log('📊 UPLOAD COMPLETED');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${successCount} images`);
  console.log(`❌ Failed: ${failCount} images`);
  console.log(`📁 Image CIDs saved to image-cids.json`);
  console.log(`📊 Total CIDs: ${Object.keys(imageCids).length}`);
}

uploadImages().catch(console.error);
