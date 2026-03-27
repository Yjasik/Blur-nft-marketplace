// app/api/nft/trades/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAlchemyClient } from '@/lib';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const tokenId = searchParams.get('tokenId');
    const chain = searchParams.get('chain') === '0x5' ? '0x5' : '0x1';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'contractAddress is required' },
        { status: 400 }
      );
    }
    
    const alchemy = getAlchemyClient(chain);
    
    // Получаем NFT из контракта
    const nfts = await alchemy.nft.getNftsForContract(contractAddress, {
      pageSize: Math.min(limit, 50),
    });
    
    // Форматируем как трансферы (текущие владельцы)
    const formattedTransfers = nfts.nfts.map((nft: any) => ({
      transaction: {
        block_number: 0,
        from_address: '0x0000000000000000000000000000000000000000',
        to_address: nft.ownerOf || 'unknown',
        transaction_hash: 'unknown',
      },
      token_id: nft.tokenId,
      contract_address: contractAddress,
      price: null,
      payment_token: 'ETH',
      created_date: new Date().toISOString(),
      event_type: 'current_owner',
      name: nft.name || `NFT #${nft.tokenId}`,
    }));
    
    // Фильтрация по tokenId
    const filtered = tokenId 
      ? formattedTransfers.filter((t: any) => t.token_id === tokenId)
      : formattedTransfers;
    
    return NextResponse.json({
      result: filtered.slice(0, limit),
      total: filtered.length,
      source: 'alchemy',
      note: 'Showing current owners, not transfer history',
    });
    
  } catch (error: any) {
    console.error('Error fetching NFT owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFT owners', details: error.message },
      { status: 500 }
    );
  }
}