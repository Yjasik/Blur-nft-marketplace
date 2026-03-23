# Blur NFT Marketplace

NFT marketplace clone built with Next.js 16, Alchemy, Wagmi, and Viem.

## Features
- Display NFT collections (`/api/nft/contract`)
- View wallet NFTs (`/api/nft/wallet`)
- Transfer history (`/api/nft/trades`)
- Wallet connection (Wagmi)

## Tech Stack
- Next.js 16 (App Router)
- Alchemy NFT API
- Wagmi + Viem
- TypeScript

## API Endpoints
- `GET /api/nft/wallet?address=0x...` - Get wallet NFTs
- `GET /api/nft/contract?contractAddress=0x...` - Get collection
- `GET /api/nft/trades?contractAddress=0x...` - Get transfers

## Environment Variables
Create `.env.local`: