// src/types/nft.ts
export interface NFTTrade {
  block_timestamp: string;
  price: number;
  transaction_hash?: string;
  token_id?: string;
}

export interface NFTDataResponse {
  result: NFTTrade[];
  status?: string;
}