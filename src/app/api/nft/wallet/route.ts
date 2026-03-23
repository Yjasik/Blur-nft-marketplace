// app/api/nft/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAlchemyClient } from '@/src/lib/alchemy-client';
import { formatAlchemyNFT } from '@/src/lib/nft-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') === '0x5' ? '0x5' : '0x1';
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const pageKey = searchParams.get('pageKey') || undefined;
    
    if (!address) {
      return NextResponse.json(
        { error: 'address is required' },
        { status: 400 }
      );
    }
    
    const alchemy = getAlchemyClient(chain);
    
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      pageSize,
      pageKey,
    });
    
    const formattedNfts = nfts.ownedNfts.map((nft: any) => 
      formatAlchemyNFT(nft, nft.contractAddress)
    );
    
    return NextResponse.json({
      data: formattedNfts,
      total: nfts.totalCount,
      nextPageKey: nfts.pageKey,
    });
    
  } catch (error: any) {
    console.error('Error fetching wallet NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet NFTs', details: error.message },
      { status: 500 }
    );
  }
}