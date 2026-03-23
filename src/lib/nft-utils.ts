
export interface FormattedNFT {
  token_id: string;
  contract_address: string;
  name: string;
  description: string;
  image_url: string | null;
  metadata: any;
  token_uri: string | null;
  attributes: any[];
}

export interface FormattedTransfer {
  transaction: {
    block_number: number;
    from_address: string;
    to_address: string;
    transaction_hash: string;
  };
  token_id: string;
  contract_address: string;
  price: string | null;
  payment_token: string;
  created_date: string;
}

export function formatAlchemyNFT(nft: any, contractAddress?: string): FormattedNFT {
  const finalContractAddress = contractAddress || nft.contractAddress || nft.contract?.address;
  
  return {
    token_id: nft.tokenId,
    contract_address: finalContractAddress,
    name: nft.name || `NFT #${nft.tokenId}`,
    description: nft.description || '',
    image_url: nft.rawMetadata?.image || nft.media?.[0]?.gateway || null,
    metadata: nft.rawMetadata || null,
    token_uri: nft.tokenUri?.raw || nft.tokenUri?.gateway || null,
    attributes: nft.rawMetadata?.attributes || [],
  };
}

export function formatAlchemyTransfer(transfer: any): FormattedTransfer {
  return {
    transaction: {
      block_number: transfer.transaction?.block_number || transfer.blockNum || 0,
      from_address: transfer.transaction?.from_address || transfer.from,
      to_address: transfer.transaction?.to_address || transfer.to,
      transaction_hash: transfer.transaction?.transaction_hash || transfer.hash,
    },
    token_id: transfer.token_id || transfer.tokenId,
    contract_address: transfer.contract_address || transfer.contractAddress,
    price: transfer.price || transfer.amount,
    payment_token: transfer.payment_token || transfer.paymentToken || 'ETH',
    created_date: transfer.created_date || transfer.timestamp || new Date().toISOString(),
  };
}