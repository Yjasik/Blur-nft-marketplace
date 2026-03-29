import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const YJS_CONTRACT = "0x2c14Ba2eA0bC4D8770550a59f238092AEcC260a6";

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

// НОВЫЕ CID для всех 10 NFT
const IMAGE_CIDS: Record<number, string> = {
  1: "bafkreiazuunpxvc5t4tjec63irbxeoofd6vky4x44slk3yitxvv3pyzorm",
  2: "bafkreiceui2mgyae3e75xewwu6giytlk6kxwpabdems3zmzw4lgrbgx3yq",
  3: "bafkreic3maloufbgpprsods3n2zl4hw3kxgleq4yrbwpgnrpcs45i3ds6m",
  4: "bafkreiczwyjngxjx5kglgkke7pdwik3oolernu6v6auvdhs2kn3hkowygq",
  5: "bafkreia4oiwp5kf5vwdx5p63arynev2hwezbxphk2cn5ohfet3o5faawpu",
  6: "bafkreibzc3wnlthe7kbogqmsv2qhpdju73p4vyrxpgzfykn3etbxmpllwi",
  7: "bafkreieqxgrp7fvk4uvkem6l5jxgp3f72rein4kouqpfq2tlpjdrea6c7e",
  8: "bafkreifendjnkt5aw4wxyjjbtkrnojgabze3vnwqh7semrn4vnjhqklue4",
  9: "bafkreiaihgpux2fcd3dmntx74ph3o3bjqtigexjggr54dhccb4nkdcosli",
  10: "bafkreigw3hkog3clmncsq4yhnxjq2yfzpteoea4vyok6hsdd5f6bx46doq",
};

function getImageUrl(cid: string): string {
  return `https://peach-handicapped-earthworm-149.mypinata.cloud/ipfs/${cid}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    
    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }
    
    const client = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`),
    });
    
    const totalSupply = await client.readContract({
      address: YJS_CONTRACT as `0x${string}`,
      abi: ERC721_ABI,
      functionName: 'totalSupply',
    }) as bigint;
    
    const nfts = [];
    
    for (let tokenId = 0; tokenId < Number(totalSupply) && nfts.length < pageSize; tokenId++) {
      try {
        const owner = await client.readContract({
          address: YJS_CONTRACT as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });
        
        if (owner.toLowerCase() === address.toLowerCase()) {
          // tokenId начинается с 0, наши CID с 1
          const cid = IMAGE_CIDS[tokenId + 1];
          const imageUrl = cid ? getImageUrl(cid) : null;
          
          nfts.push({
            token_id: tokenId.toString(),
            contract_address: YJS_CONTRACT,
            name: `YJS Master #${tokenId}`,
            description: `YJS Master NFT #${tokenId}`,
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
        }
      } catch (error) {
        // Skip
      }
    }
    
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
