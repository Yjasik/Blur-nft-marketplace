'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import styles from "@/styles/Home.module.css";

interface PortfolioTitleProps {
  nftCount?: number;
  collectionCount?: number;
}

export default function PortfolioTitle({ nftCount, collectionCount }: PortfolioTitleProps) {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) return null;

  return (
    <section className={styles.portfolioComponent_section}>
      <div className={styles.portfolioTitleContent}>
        <div className={styles.portfolioTitleLeft}>
          <h2 className={styles.portfolioTitle}>
            {isConnected ? (
              <>
                <span className={styles.portfolioTitleIcon}>🎨</span>
                My NFT Portfolio
                <span className={styles.portfolioAddress}>
                  ({formatAddress(address || '')})
                </span>
              </>
            ) : (
              'NFT Portfolio'
            )}
          </h2>
          {isConnected && (nftCount !== undefined || collectionCount !== undefined) && (
            <div className={styles.portfolioStats}>
              {nftCount !== undefined && (
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{nftCount}</span>
                  <span className={styles.statLabel}>NFTs</span>
                </div>
              )}
              {collectionCount !== undefined && (
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{collectionCount}</span>
                  <span className={styles.statLabel}>Collections</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.portfolioTitleRight}>
          <div className={styles.portfolioActions}>
            <button className={styles.refreshButton} onClick={() => window.location.reload()}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}