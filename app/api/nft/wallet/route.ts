// app/api/nft/wallet/route.ts (упрощенная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getAlchemyClient } from '@/lib/alchemy-client';
import { formatAlchemyNFT } from '@/lib/nft-utils';

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
    
    // ✅ Убираем orderBy, оставляем только базовые опции
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      pageSize,
      pageKey,
    });
    
    // ✅ Используем contractAddress вместо contract.address
    const formattedNfts = nfts.ownedNfts.map((nft: any) => 
      formatAlchemyNFT(nft, nft.contractAddress)
    );
    
    return NextResponse.json({
      data: formattedNfts,
      total: nfts.totalCount,
      nextPageKey: nfts.pageKey,
    });
    
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet NFTs' },
      { status: 500 }
    );
  }
}