'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import styles from "@/styles/Home.module.css";
import GetNfts from './GetNfts';
import PortfolioTitle from './PortfolioTitle';

export default function PortfolioData() {
  const { address, isConnected } = useAccount();
  const [nftCount, setNftCount] = useState<number>(0);
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !address) return;

      try {
        const response = await fetch(`/api/nft/wallet?address=${address}&pageSize=100`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            setNftCount(data.data.length);
            // Подсчет уникальных коллекций
            const uniqueCollections = new Set(data.data.map((nft: any) => nft.contract_address));
            setCollectionCount(uniqueCollections.size);
          }
        }
      } catch (error) {
        console.error('Error fetching NFT stats:', error);
      }
    };

    fetchStats();
  }, [address, isConnected]);

  if (!mounted) return null;

  return (
    <section className={styles.portfolioData_section}>
      <PortfolioTitle nftCount={nftCount} collectionCount={collectionCount} />
      <div className={styles.portfolioContent}>
        <GetNfts limit={50} />
      </div>
    </section>
  );
}