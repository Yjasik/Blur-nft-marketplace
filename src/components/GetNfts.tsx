'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import styles from "@/styles/Home.module.css";

// SVG иконка ETH
const EthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
       className="ethIconSmall" 
       style={{ width: '0.7rem', height: '0.7rem', display: 'inline-block', marginLeft: '0.2rem' }}>
    <path d="M12 1.5L4.5 12 12 15.75 19.5 12 12 1.5zM12 16.5L4.5 12 12 22.5 19.5 12 12 16.5z" />
  </svg>
);

// Компонент-заглушка для NFT
const NFTPlaceholder = () => (
  <div className={styles.nftPlaceholder}>
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect width="80" height="80" fill="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/>
      <text x="40" y="48" textAnchor="middle" fill="white" fontSize="14" fontFamily="monospace">NFT</text>
    </svg>
  </div>
);

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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

  const handleImageError = (tokenId: string) => {
    setImageErrors(prev => ({ ...prev, [tokenId]: true }));
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
      {nfts.map((nft, index) => {
        const hasError = imageErrors[nft.token_id];
        const imageUrl = nft.image_url && !hasError ? nft.image_url : null;
        
        return (
          <div key={`${nft.contract_address}-${nft.token_id}`} className={styles.nftCard}>
            <Link href={`/collection/${formatAddress(nft.contract_address)}/${nft.token_id}`}>
              <div className={styles.nftImageContainer}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={nft.name}
                    width={300}
                    height={300}
                    className={styles.nftImage}
                    onError={() => handleImageError(nft.token_id)}
                    unoptimized
                  />
                ) : (
                  <NFTPlaceholder />
                )}
                {nft.estimated_value && (
                  <div className={styles.nftPrice}>
                    {nft.estimated_value.toFixed(2)}
                    <EthIcon />
                  </div>
                )}
              </div>
              <div className={styles.nftInfo}>
                <h3 className={styles.nftName}>{nft.name}</h3>
                <p className={styles.nftCollection}>{nft.collection_name || 'Collection'}</p>
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className={styles.nftAttributes}>
                    <span className={styles.attributeBadge}>
                      {nft.attributes[0]?.trait_type}: {nft.attributes[0]?.value}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}