// app/api/nft/trades/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAlchemyClient } from '@/lib/alchemy-client';

export async function GET(request: NextRequest) {
  // ✅ Объявляем переменные на уровне функции, чтобы они были доступны везде
  let contractAddress: string | null = null;
  let tokenId: string | null = null;
  let chain: string = '0x1';
  let limit: number = 20;
  
  try {
    const { searchParams } = new URL(request.url);
    contractAddress = searchParams.get('contractAddress');
    tokenId = searchParams.get('tokenId');
    chain = searchParams.get('chain') === '0x5' ? '0x5' : '0x1';
    limit = parseInt(searchParams.get('limit') || '20');
    
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'contractAddress is required' },
        { status: 400 }
      );
    }
    
    // Проверяем, есть ли Alchemy клиент
    let alchemy;
    try {
      alchemy = getAlchemyClient(chain);
    } catch (error: any) {
      console.error('Alchemy client error:', error.message);
      
      // ✅ Теперь переменные доступны
      const demoTransfers = generateDemoTransfers(contractAddress, tokenId, limit);
      return NextResponse.json({
        result: demoTransfers,
        total: demoTransfers.length,
        source: 'demo',
        message: 'Demo data - Alchemy API key not configured',
      });
    }
    
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
      name: nft.name,
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
    console.error('Error:', error);
    
    // ✅ Теперь переменные доступны здесь
    if (error.message?.includes('401') || error.message?.includes('authenticated')) {
      return NextResponse.json({
        result: generateDemoTransfers(contractAddress || 'unknown', tokenId, limit),
        total: limit,
        source: 'demo',
        message: 'Alchemy API key invalid or missing. Please check ALCHEMY_API_KEY_MAINNET in .env.local',
      });
    }
    
    // ✅ Используем contractAddress с проверкой на null
    const demoResult = generateDemoTransfers(contractAddress || 'unknown', tokenId, limit);
    
    return NextResponse.json({
      result: demoResult,
      total: demoResult.length,
      source: 'demo',
      error: error.message,
      message: 'Using demo data due to error',
    });
  }
}

// Функция для генерации демо-данных
function generateDemoTransfers(contractAddress: string, tokenId: string | null, limit: number) {
  const transfers = [];
  const count = Math.min(limit, 10);
  
  for (let i = 0; i < count; i++) {
    const demoTokenId = tokenId || String(i + 1);
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    transfers.push({
      transaction: {
        block_number: 17890000 + i,
        from_address: `0x${Math.random().toString(16).substring(2, 42)}`,
        to_address: `0x${Math.random().toString(16).substring(2, 42)}`,
        transaction_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      },
      token_id: demoTokenId,
      contract_address: contractAddress,
      price: (Math.random() * 10).toFixed(18),
      payment_token: 'ETH',
      created_date: date.toISOString(),
      event_type: i % 2 === 0 ? 'sale' : 'transfer',
      name: `NFT #${demoTokenId}`,
    });
  }
  
  return transfers;
}