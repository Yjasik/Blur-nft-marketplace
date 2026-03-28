const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// ВАШ АДРЕС КОНТРАКТА
const CONTRACT_ADDRESS = "0x9D8ef4B09076686Df6fD78ad483861786bF33fb2";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY_SEPOLIA;
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ABI = [
  "function mintNft(address recipient, string memory tokenURI) public returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)"
];

async function mintNFTs() {
  console.log("=".repeat(50));
  console.log("🚀 YJS MASTER NFT MINTING");
  console.log("=".repeat(50));
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  
  console.log(`\n✅ Connected to Sepolia`);
  console.log(`📝 Wallet: ${wallet.address}`);
  
  const owner = await contract.owner();
  console.log(`👑 Owner: ${owner}`);
  
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    console.error(`\n❌ You are not the owner!`);
    return;
  }
  console.log("✅ Verified owner");
  
  const tokenURIs = JSON.parse(fs.readFileSync('./token-uris.json', 'utf8'));
  console.log(`\n📦 Loaded ${Object.keys(tokenURIs).length} token URIs`);
  
  const currentSupply = await contract.totalSupply();
  console.log(`📊 Current supply: ${currentSupply}`);
  
  const tokensToMint = Object.keys(tokenURIs);
  console.log(`🎨 NFTs to mint: ${tokensToMint.length}\n`);
  
  let successCount = 0;
  
  for (let i = 0; i < tokensToMint.length; i++) {
    const tokenId = tokensToMint[i];
    const uri = tokenURIs[tokenId];
    
    process.stdout.write(`[${i + 1}/${tokensToMint.length}] Minting #${tokenId}... `);
    
    try {
      const tx = await contract.mintNft(wallet.address, uri);
      const receipt = await tx.wait();
      console.log(`✅ ${tx.hash.slice(0, 10)}... (block ${receipt.blockNumber})`);
      successCount++;
      
      if (i < tokensToMint.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`❌ ${error.message.slice(0, 80)}`);
      break;
    }
  }
  
  const newSupply = await contract.totalSupply();
  console.log("\n" + "=".repeat(50));
  console.log("✅ MINTING COMPLETED");
  console.log("=".repeat(50));
  console.log(`✅ Minted: ${successCount} NFTs`);
  console.log(`📈 Total supply: ${newSupply}`);
  console.log(`🔍 View: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
  console.log(`🖼️  OpenSea: https://testnets.opensea.io/address/${CONTRACT_ADDRESS}`);
}

mintNFTs().catch(console.error);
