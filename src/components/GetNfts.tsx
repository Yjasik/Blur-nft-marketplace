'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import styles from "@/styles/Home.module.css";
import CardComp from './CardComp';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';

interface NFT {
  token_id: string;
  contract_address: string;
  name: string;
  description: string;
  image_url: string | null;
  metadata: any;
  token_uri: string | null;
  attributes: Array<{ trait_type: string; value: string }>;
  collection_name?: string;
  floor_price?: number;
  estimated_value?: number;
}

interface GetNftsProps {
  limit?: number;
}

export default function GetNfts({ limit = 20 }: GetNftsProps) {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isConnected || !address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/nft/wallet?address=${address}&pageSize=${limit}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
          setNfts(data.data);
        } else {
          setNfts([]);
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, isConnected, limit]);

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className={styles.connectWalletMessage}>
        <div className={styles.messageIcon}>🔌</div>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to view your NFT collection</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingGrid}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.nftCardSkeleton}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonTextShort}></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Error Loading NFTs</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🖼️</div>
        <h3>No NFTs Found</h3>
        <p>You don't own any NFTs in this wallet yet</p>
        <Link href="/collections" className={styles.exploreButton}>
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.nftGrid}>
      {nfts.map((nft) => (
        <CardComp
          key={`${nft.contract_address}-${nft.token_id}`}
          nft={nft}
          marketplaceAddress={CONTRACT_ADDRESSES.NFT_MARKETPLACE as `0x${string}`}
        />
      ))}
    </div>
  );
}
