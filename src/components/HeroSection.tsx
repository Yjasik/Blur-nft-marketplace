'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

// Уменьшенная иконка Ethereum
const EthIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="ethIconSmall"
    style={{ width: '0.7rem', height: '0.7rem', display: 'inline-block', marginLeft: '0.2rem' }}
  >
    <path d="M12 1.5L4.5 12 12 15.75 19.5 12 12 1.5zM12 16.5L4.5 12 12 22.5 19.5 12 12 16.5z" />
  </svg>
);

const ArrowIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-4 h-4 inline-block ml-1"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

// Контракт BAYC
const BAYC_ADDRESS = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

export default function HeroSection() {
  const [oneDayTradingVolume, setOneDayTradingVolume] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [floorPrice, setFloorPrice] = useState<number>(67.90);

  useEffect(() => {
    const getNFTData = async () => {
      try {
        setIsLoading(true);
        
        // Временные мок-данные
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
      
      <section className={styles.carousel}>
        {/* Bored Ape Yacht Club */}
        <div className={styles.carousel_section}>
          <Image
            src="/assets/blurBackground.png"
            alt="bored ape yacht club"
            width={300}
            height={200}
            className={styles.carousel_img}
            priority
          />
          <Image
            src="/assets/bayc_profile.webp"
            alt="bored ape yacht club profile"
            width={40}
            height={40}
            className={styles.carousel_profile}
          />
          <p>Bored Ape Yacht Club</p>
        </div>
        
        {/* Checks VV Originals */}
        <div className={styles.carousel_section}>
          <Image
            src="/assets/checksVVOriginals.png"
            alt="checks vv originals"
            width={300}
            height={200}
            className={styles.carousel_img}
          />
          <Image
            src="/assets/checksbboriginals_profile.webp"
            alt="checks vv originals profile"
            width={40}
            height={40}
            className={styles.carousel_profile}
          />
          <p>Checks VV Originals</p>
        </div>
        
        {/* Azuki */}
        <Link href="/viewcollection">
          <div className={styles.carousel_section}>
            <Image
              src="/assets/azuki.png"
              alt="azuki"
              width={300}
              height={200}
              className={styles.carousel_img}
            />
            <Image
              src="/assets/azuki_profile.webp"
              alt="azuki profile"
              width={40}
              height={40}
              className={styles.carousel_profile}
            />
            <p>Azuki</p>
          </div>
        </Link>
        
        {/* Pudgy Penguins */}
        <div className={styles.carousel_section}>
          <Image
            src="/assets/pudgyPenguins.png"
            alt="pudgy penguins"
            width={300}
            height={200}
            className={styles.carousel_img}
          />
          <Image
            src="/assets/pudgypenguins_profile.webp"
            alt="pudgy penguins profile"
            width={40}
            height={40}
            className={styles.carousel_profile}
          />
          <p>Pudgy Penguins</p>
        </div>
        
        {/* Moonbirds */}
        <div className={styles.carousel_section}>
          <Image
            src="/assets/moonbirds.png"
            alt="moonbirds"
            width={300}
            height={200}
            className={styles.carousel_img}
          />
          <Image
            src="/assets/moonbirds_profile.webp"
            alt="moonbirds profile"
            width={40}
            height={40}
            className={styles.carousel_profile}
          />
          <p>Moonbirds</p>
        </div>
      </section>
    </section>
  );
}