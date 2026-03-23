import { NextRequest, NextResponse } from 'next/server';
import { getAlchemyClient } from '@/lib/alchemy-client';
import { getViemClient } from '@/lib/viem-client';
import { formatAlchemyNFT } from '@/lib/nft-utils';

const erc721Abi = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const chain = searchParams.get('chain') === '0x5' ? '0x5' : '0x1';
    const limit = parseInt(searchParams.get('limit') || '50');
    const pageKey = searchParams.get('pageKey') || undefined;
    
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'contractAddress is required' },
        { status: 400 }
      );
    }
    
    const alchemy = getAlchemyClient(chain);
    const viemClient = getViemClient(chain);
    
    // Получаем информацию о коллекции через viem
    let name = 'Unknown Collection';
    let symbol = 'UNKNOWN';
    let totalSupply = null;
    
    try {
      const contractName = await viemClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'name',
      });
      name = contractName as string;
    } catch (e) {}
    
    try {
      const contractSymbol = await viemClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'symbol',
      });
      symbol = contractSymbol as string;
    } catch (e) {}
    
    try {
      const supply = await viemClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'totalSupply',
      });
      totalSupply = Number(supply);
    } catch (e) {}
    
    // Получаем NFT из контракта через Alchemy
    const nfts = await alchemy.nft.getNftsForContract(contractAddress, {
      pageSize: limit,
      pageKey,
    });
    
    // ✅ Форматируем NFT с метаданными
    const formattedNfts = nfts.nfts.map((nft: any) => ({
      token_id: nft.tokenId,
      contract_address: contractAddress,
      name: nft.name || nft.rawMetadata?.name || `NFT #${nft.tokenId}`,
      description: nft.description || nft.rawMetadata?.description || '',
      image_url: nft.rawMetadata?.image || nft.media?.[0]?.gateway || null,
      metadata: nft.rawMetadata || null,
      token_uri: nft.tokenUri?.raw || nft.tokenUri?.gateway || null,
      attributes: nft.rawMetadata?.attributes || [],
    }));
    
    return NextResponse.json({
      collection: {
        address: contractAddress,
        name,
        symbol,
        totalSupply: totalSupply,
      },
      nfts: formattedNfts,
      nextPageKey: nfts.pageKey,
      hasMore: !!nfts.pageKey,
      currentCount: formattedNfts.length,
    });
    
  } catch (error) {
    console.error('Error fetching contract NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract NFTs' },
      { status: 500 }
    );
  }
}