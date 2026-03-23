// lib/alchemy-client.ts
import { Alchemy, Network } from 'alchemy-sdk';

// Проверяем наличие ключей
const mainnetKey = process.env.ALCHEMY_API_KEY_MAINNET;
const sepoliaKey = process.env.ALCHEMY_API_KEY_SEPOLIA;

if (!mainnetKey) {
  console.warn('⚠️ ALCHEMY_API_KEY_MAINNET is not set in .env.local');
}

if (!sepoliaKey) {
  console.warn('⚠️ ALCHEMY_API_KEY_SEPOLIA is not set in .env.local');
}

// Создаем клиенты с правильной конфигурацией
export const alchemyMainnet = mainnetKey ? new Alchemy({
  apiKey: mainnetKey,
  network: Network.ETH_MAINNET,
}) : null;

export const alchemySepolia = sepoliaKey ? new Alchemy({
  apiKey: sepoliaKey,
  network: Network.ETH_SEPOLIA,
}) : null;

export function getAlchemyClient(chainId: string = '0x1') {
  const client = chainId === '0x5' ? alchemySepolia : alchemyMainnet;
  
  if (!client) {
    throw new Error(`Alchemy client not initialized for chain ${chainId}. Check your API keys in .env.local`);
  }
  
  return client;
}

export function getRpcUrl(chainId: string = '0x1') {
  const key = chainId === '0x5' 
    ? process.env.ALCHEMY_API_KEY_SEPOLIA 
    : process.env.ALCHEMY_API_KEY_MAINNET;
  
  if (!key) {
    throw new Error(`Alchemy API key not found for chain ${chainId}`);
  }
  
  if (chainId === '0x5') {
    return `https://eth-sepolia.g.alchemy.com/v2/${key}`;
  }
  return `https://eth-mainnet.g.alchemy.com/v2/${key}`;
}