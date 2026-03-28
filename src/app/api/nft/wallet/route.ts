// app/api/nft/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAlchemyClient, formatAlchemyNFT } from '@/lib';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

// Адрес вашего контракта YJS Master
const YJS_CONTRACT = "0x2c14Ba2eA0bC4D8770550a59f238092AEcC260a6";

// ABI для чтения владельцев
const ERC721_ABI = [
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// CID изображений из Pinata (все 100 изображений)
// Вот первые 10, остальные нужно добавить по аналогии
const IMAGE_CIDS: Record<number, string> = {
  0: "bafkreibhtmlmssd6zrfxfqdjr44d5gsw6vbvrnihlq2li6h2cz3ad2nrnm",
  1: "bafkreidsrjpm7svp5zzm4rensijn5dszrsiy24pnmshi5bh6r75uvxfgte",
  2: "bafkreickjfiqvnciikatrh7bkxafi6pxk2k6dfyv2ijxnh5ezfwzy5vnou",
  3: "bafkreif2qaomrdpak3l5k33xfbx4cx3evf64tm7ndosakigl63idtgqs4y",
  4: "bafkreif5tmon6w3in4hhfndfewob7xclf6ocyoexh4rj26zxyj2xam3ary",
  5: "bafkreibghii4dsum2spa4ro6om5rbykn2i4bpfhcz5livgibsai3y6fsa4",
  6: "bafkreidngjfr6xd6u5mfkesgdlykyanr36bh6ci2tnzelw774rdgai4qju",
  7: "bafkreidung535dz57grzuqkyyghusi6fdayrz3asroguxwdfrfezo767vi",
  8: "bafkreibk2qiv72ipwkzbjvuexr3o4wv7ancpek6uphhfkm2tyjs2mlfmsa",
  9: "bafkreifhimpdf4dcfkhzyb5tafwjpfpdcrqzlpwnizfagjhuiighwcaxce",
  // Добавьте остальные CID для tokenId 10-99
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chain = searchParams.get('chain') === '0x5' ? '0x5' : '0x1';
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    
    if (!address) {
      return NextResponse.json(
        { error: 'address is required' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Fetching NFTs for wallet: ${address}`);
    
    // Создаем клиент для чтения из блокчейна
    const client = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`),
    });
    
    // Получаем общее количество NFT
    let totalSupply = 0n;
    try {
      totalSupply = await client.readContract({
        address: YJS_CONTRACT as `0x${string}`,
        abi: ERC721_ABI,
        functionName: 'totalSupply',
      }) as bigint;
    } catch (e) {
      console.error('Failed to get totalSupply:', e);
      totalSupply = 10n; // fallback
    }
    
    console.log(`[API] Total supply: ${totalSupply}`);
    
    const nfts = [];
    
    // Проверяем каждый tokenId
    for (let tokenId = 0; tokenId < Number(totalSupply) && nfts.length < pageSize; tokenId++) {
      try {
        const owner = await client.readContract({
          address: YJS_CONTRACT as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });
        
        if (owner.toLowerCase() === address.toLowerCase()) {
          // Получаем CID изображения для этого tokenId
          const imageCid = IMAGE_CIDS[tokenId];
          
          let imageUrl = null;
          if (imageCid) {
            imageUrl = `https://ipfs.io/ipfs/${imageCid}`;
          } else {
            // Если CID нет, используем заглушку
            imageUrl = null;
          }
          
          console.log(`[API] NFT #${tokenId}: image CID = ${imageCid}, URL = ${imageUrl}`);
          
          nfts.push({
            token_id: tokenId.toString(),
            contract_address: YJS_CONTRACT,
            name: `YJS Master #${tokenId}`,
            description: `YJS Master NFT #${tokenId} - Exclusive collection`,
            image_url: imageUrl,
            metadata: null,
            token_uri: null,
            attributes: [
              { trait_type: "Rarity", value: tokenId < 7 ? "Common" : tokenId < 9 ? "Rare" : "Epic" },
              { trait_type: "Collection", value: "YJS Master" }
            ],
            collection_name: "YJS Master",
            estimated_value: 0.05,
          });
          
          console.log(`[API] Found NFT #${tokenId} owned by ${address}`);
        }
      } catch (error) {
        console.log(`[API] Token #${tokenId}: error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
    
    console.log(`[API] Found ${nfts.length} NFTs for wallet ${address}`);
    
    return NextResponse.json({
      data: nfts,
      total: nfts.length,
      nextPageKey: null,
    });
    
  } catch (error: any) {
    console.error('Error fetching wallet NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet NFTs', details: error.message },
      { status: 500 }
    );
  }
}
