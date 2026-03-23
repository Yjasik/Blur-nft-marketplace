import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { getRpcUrl } from './alchemy-client';

// Клиент для Ethereum Mainnet
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(getRpcUrl('0x1')),
});

// Клиент для Sepolia Testnet
export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(getRpcUrl('0x5')),
});

// Функция для получения клиента по chain ID
export function getViemClient(chainId: string = '0x1') {
  return chainId === '0x5' ? sepoliaClient : mainnetClient;
}