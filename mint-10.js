const { ethers } = require('ethers');
const fs = require('fs');

// НОВЫЙ АДРЕС КОНТРАКТА
const CONTRACT_ADDRESS = "0x2c14Ba2eA0bC4D8770550a59f238092AEcC260a6";

// Ваши ключи
const ALCHEMY_KEY = "2tOGNEfu6DS9NBXgZOC_V6-zb71LnHhY";
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
const PRIVATE_KEY = "0x5d670a78c6aefe4f8d6956cc79b0943b0bd46d709ac506cf3d220cbf5344f67f";

const ABI = [
  "function mintNft(address recipient, string memory tokenURI) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)"
];

async function mint() {
  console.log("=".repeat(50));
  console.log("🚀 MINTING 10 YJS MASTER NFTs");
  console.log("=".repeat(50));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  
  console.log(`\n📝 Wallet: ${wallet.address}`);
  
  const owner = await contract.owner();
  console.log(`👑 Owner: ${owner}`);
  
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error(`❌ You are not the owner!`);
    return;
  }
  console.log("✅ Verified owner");
  
  // Загружаем все URIs
  const allURIs = JSON.parse(fs.readFileSync('./token-uris.json', 'utf8'));
  const tokenIds = Object.keys(allURIs).slice(0, 10);
  
  console.log(`\n📦 Minting ${tokenIds.length} NFTs\n`);
  
  let successCount = 0;
  
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    const uri = allURIs[tokenId];
    
    process.stdout.write(`[${i + 1}/${tokenIds.length}] Minting NFT #${tokenId}... `);
    
    try {
      const tx = await contract.mintNft(wallet.address, uri);
      const receipt = await tx.wait();
      console.log(`✅ ${tx.hash.slice(0, 10)}... (block ${receipt.blockNumber})`);
      successCount++;
      
      if (i < tokenIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`❌ ${error.message.slice(0, 80)}`);
      break;
    }
  }
  
  const total = await contract.totalSupply();
  console.log("\n" + "=".repeat(50));
  console.log("✅ MINTING COMPLETED");
  console.log("=".repeat(50));
  console.log(`✅ Minted: ${successCount} NFTs`);
  console.log(`📈 Total supply: ${total}`);
  console.log(`🔍 View: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
  console.log(`🖼️  OpenSea: https://testnets.opensea.io/address/${CONTRACT_ADDRESS}`);
}

mint().catch(console.error);
