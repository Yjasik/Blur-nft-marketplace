export const CONTRACT_ADDRESSES = {
  // YJS Master NFT Collection
  YJS_MASTER: "0x2c14Ba2eA0bC4D8770550a59f238092AEcC260a6",
  
  // NFT Marketplace - НОВЫЙ АДРЕС
  NFT_MARKETPLACE: "0xCF61BcDF89577B19DE0e27B585630B11B4AD1870",
  
  // Networks
  SEPOLIA: "0x5",
  MAINNET: "0x1",
} as const;

export type ContractAddresses = typeof CONTRACT_ADDRESSES;

export const getContractAddresses = (chainId: string) => {
  if (chainId === "0x5") {
    return CONTRACT_ADDRESSES;
  }
  return CONTRACT_ADDRESSES;
};
