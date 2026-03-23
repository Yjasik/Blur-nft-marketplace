'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import styles from "@/styles/Home.module.css";

// SVG иконки
const EthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 inline-block ml-1">
    <path d="M12 1.5L4.5 12 12 15.75 19.5 12 12 1.5zM12 16.5L4.5 12 12 22.5 19.5 12 12 16.5z" />
  </svg>
);

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block ml-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

// ABI для ERC20 (для получения цены ETH)
const erc20Abi = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Контракт BAYC
const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

export default function HeroSection() {
  const [oneDayTradingVolume, setOneDayTradingVolume] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [floorPrice, setFloorPrice] = useState<number>(67.90);

  useEffect(() => {
    // Здесь можно добавить запрос к стороннему API для получения цены
    // Например, через CoinGecko или The Graph
    const getNFTData = async () => {
      try {
        setIsLoading(true);
        
        // Временные мок-данные
        // В реальном приложении можно использовать:
        // 1. Alchemy NFT API
        // 2. OpenSea API
        // 3. The Graph для данных из блокчейна
        
        const mockVolume = 125.67;
        setOneDayTradingVolume(mockVolume);
        
      } catch (error) {
        console.error("Error fetching NFT data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getNFTData();
  }, []);

  return (
    <section className={styles.heroSection}>
      <h2>Bored Ape Yacht Club</h2>
      <p>BY YUGALABS</p>
      
      <section className={styles.bayc_data}>
        <section>
          <p className={styles.bayc_data__title}>FLOOR PRICE</p>
          <p>
            {floorPrice}
            <EthIcon />
          </p>
        </section>
        
        <section>
          <p className={styles.bayc_data__title}>1D VOLUME</p>
          <p className={styles.collection_oneDayTradingVolume}>
            {isLoading ? 'Loading...' : oneDayTradingVolume.toFixed(2)}
            <EthIcon />
          </p>
        </section>
        
        <Link href={`/collection/${BAYC_ADDRESS}`}>
          <button className={styles.viewCollection_btn}>
            VIEW COLLECTION
            <ArrowIcon />
          </button>
        </Link>
      </section>
      
      {/* Остальной JSX с изображениями */}
    </section>
  );
}