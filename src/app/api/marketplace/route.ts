// app/api/marketplace/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import MarketplaceABI from '@/contracts/abi/NFTMarketplace.json';

// Типы для MarketItem
interface MarketItem {
  marketItemId: bigint;
  tokenId: bigint;
  nftContract: string;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
}

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionAddress = searchParams.get('collectionAddress');
    
    // Проверяем, что адрес маркетплейса настроен
    if (!MARKETPLACE_ADDRESS) {
      console.error('MARKETPLACE_ADDRESS is not configured');
      return NextResponse.json(
        { listings: [], total: 0, message: 'Marketplace address not configured' },
        { status: 200 }
      );
    }
    
    const client = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`),
    });
    
    let listings: any[] = [];
    let error: string | null = null;
    
    try {
      // Пробуем получить листинги через getActiveListings
      const result = await Promise.race([
        client.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: MarketplaceABI.abi,
          functionName: 'getActiveListings',
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      
      listings = result as any[];
      
    } catch (contractError: any) {
      console.error('Contract read error:', contractError);
      error = contractError.message;
      
      // Пробуем альтернативный метод - получаем листинги через getMarketItem по ID
      try {
        // Получаем общее количество созданных лотов
        const marketItemIds = await client.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: MarketplaceABI.abi,
          functionName: '_marketItemIds',
        }) as bigint;
        
        console.log('Total market items:', Number(marketItemIds));
        
        // Перебираем все ID и получаем активные лоты
        const maxItems = Math.min(Number(marketItemIds), 100); // Ограничиваем 100
        for (let i = 1; i <= maxItems; i++) {
          try {
            const item = await client.readContract({
              address: MARKETPLACE_ADDRESS,
              abi: MarketplaceABI.abi,
              functionName: 'getMarketItem',
              args: [BigInt(i)],
            });
            
            // item возвращается как кортеж [tokenId, nftContract, seller, owner, price, sold]
            if (item && Array.isArray(item) && !item[5] && item[4] > 0n) {
              listings.push({
                marketItemId: BigInt(i),
                tokenId: item[0],
                nftContract: item[1],
                seller: item[2],
                owner: item[3],
                price: item[4],
                sold: item[5],
              });
            }
          } catch (e) {
            // Лот не существует, пропускаем
          }
        }
      } catch (altError) {
        console.error('Alternative method failed:', altError);
      }
    }
    
    // Фильтруем по коллекции если указана
    const filteredListings = collectionAddress 
      ? listings.filter((listing: any) => {
          const listingContract = typeof listing.nftContract === 'string' 
            ? listing.nftContract 
            : listing.nftContract?.toString?.() || '';
          return listingContract.toLowerCase() === collectionAddress.toLowerCase();
        })
      : listings;
    
    // Форматируем ответ
    const formattedListings = filteredListings.map((listing: any, index: number) => ({
      marketItemId: Number(listing.marketItemId),
      tokenId: Number(listing.tokenId),
      nftContract: typeof listing.nftContract === 'string' 
        ? listing.nftContract 
        : listing.nftContract?.toString?.() || '',
      seller: typeof listing.seller === 'string' 
        ? listing.seller 
        : listing.seller?.toString?.() || '',
      price: listing.price?.toString?.() || '0',
      sold: listing.sold === true,
    }));
    
    return NextResponse.json({
      listings: formattedListings,
      total: formattedListings.length,
      hasContractError: !!error,
      message: error || null,
    });
    
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { listings: [], total: 0, error: error.message },
      { status: 200 }
    );
  }
}