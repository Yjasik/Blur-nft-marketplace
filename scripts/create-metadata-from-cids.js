const fs = require('fs');
const path = require('path');

// Загружаем CID изображений
let imageCids = {};
try {
  imageCids = JSON.parse(fs.readFileSync('./image-cids.json', 'utf8'));
  console.log(`✅ Loaded ${Object.keys(imageCids).length} image CIDs`);
} catch (e) {
  console.log('⚠️  No image-cids.json found, using placeholder');
}

const totalNFTs = 100;
const metadataDir = path.join(__dirname, '../metadata');
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir);
}

const tokenURIs = {};

for (let i = 1; i <= totalNFTs; i++) {
  // Определяем редкость
  let rarity;
  if (i <= 70) rarity = "Common";
  else if (i <= 90) rarity = "Rare";
  else rarity = "Epic";
  
  const elements = ["Fire", "Water", "Earth", "Air", "Magic"];
  const element = elements[i % elements.length];
  const power = Math.floor(Math.random() * 100) + 1;
  
  const metadata = {
    name: `YJS Master #${i}`,
    description: "YJS Master - Exclusive NFT Collection from the YJS ecosystem. Limited edition collection of 10,000 unique NFTs.",
    image: imageCids[i] 
      ? `ipfs://${imageCids[i]}`
      : `ipfs://QmPlaceholder/${i}.png`,
    attributes: [
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Element", value: element },
      { trait_type: "Power", value: power },
      { trait_type: "Generation", value: "Genesis" },
      { trait_type: "Collection", value: "YJS Master" }
    ],
    external_url: "https://yjsmaster.com",
    background_color: "000000"
  };
  
  // Сохраняем JSON
  const metadataPath = path.join(metadataDir, `${i}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  // Создаем временный URI (будет заменен после загрузки метаданных)
  tokenURIs[i] = `ipfs://temp-${i}`;
  
  if (i % 10 === 0) {
    console.log(`✅ Created metadata/${i}.json`);
  }
}

console.log(`\n✅ Created ${totalNFTs} metadata files in metadata/`);
