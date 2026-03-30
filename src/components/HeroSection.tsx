'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { EthIcon, ArrowIcon } from "@/components/icons";


// Данные карточек с полной информацией
const CARDS_DATA = [
  { 
    name: "Bored Ape Yacht Club", 
    author: "BY YUGALABS",
    background: "/assets/blurBackground.png", 
    profile: "/assets/bayc_profile.webp", 
    link: "/collection/bored-ape-yacht-club",
    floorPrice: "67.90",
    volume: "125.67"
  },
  { 
    name: "Checks - VV Originals", 
    author: "BY Visualize Value",
    background: "/assets/checksVVOriginals.png", 
    profile: "/assets/checksbboriginals_profile.webp", 
    link: "/collection/checks-vv-originals",
    floorPrice: "0.15",
    volume: "0.14"
  },
  { 
    name: "Azuki", 
    author: "BY CHIRU LABS",
    background: "/assets/azuki.png", 
    profile: "/assets/azuki_profile.webp", 
    link: "/viewcollection",
    floorPrice: "0.70",
    volume: "20.12"
  },
  { 
    name: "Pudgy Penguins", 
    author: "BY Pudgy Penguins",
    background: "/assets/pudgyPenguins.png", 
    profile: "/assets/pudgypenguins_profile.webp", 
    link: "/collection/pudgy-penguins",
    floorPrice: "4.15",
    volume: "58.21"
  },
  { 
    name: "Moonbirds", 
    author: "BY Moonbirds",
    background: "/assets/moonbirds.png", 
    profile: "/assets/moonbirds_profile.webp", 
    link: "/collection/moonbirds",
    floorPrice: "0.91",
    volume: "10.43"
  },
];

type HeroSectionProps = {
  onCardClick?: (background: string, name: string, author: string) => void;
  collectionName: string;
  collectionAuthor: string;
};

export default function HeroSection({ onCardClick, collectionName, collectionAuthor }: HeroSectionProps) {
  const [oneDayTradingVolume, setOneDayTradingVolume] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [floorPrice, setFloorPrice] = useState<number>(67.90);

  useEffect(() => {
    const getNFTData = async () => {
      try {
        setIsLoading(true);
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

  const handleCardClick = (card: typeof CARDS_DATA[0]) => {
    if (onCardClick) {
      onCardClick(card.background, card.name, card.author);
    }
  };

  // Находим текущую активную карточку для отображения данных
  const getCurrentCardData = () => {
    const currentCard = CARDS_DATA.find(card => 
      collectionName === card.name
    );
    return currentCard || CARDS_DATA[2]; // По умолчанию Azuki
  };

  const currentCard = getCurrentCardData();

  return (
    <section className={styles.heroSection}>
      <h2>{collectionName}</h2>
      <p>{collectionAuthor}</p>
      
      <section className={styles.bayc_data}>
        <section>
          <p className={styles.bayc_data__title}>FLOOR PRICE</p>
          <p>
            {currentCard.floorPrice}
            <EthIcon />
          </p>
        </section>
        
        <section>
          <p className={styles.bayc_data__title}>1D VOLUME</p>
          <p className={styles.collection_oneDayTradingVolume}>
            {isLoading ? 'Loading...' : currentCard.volume}
            <EthIcon />
          </p>
        </section>
        
        <Link href={currentCard.link}>
          <button className={styles.viewCollection_btn}>
            VIEW COLLECTION
            <ArrowIcon />
          </button>
        </Link>
      </section>
      
      <section className={styles.carousel}>
        {CARDS_DATA.map((card, index) => (
          <div 
            key={index} 
            className={`${styles.carousel_section} ${collectionName === card.name ? styles.active : ''}`}
            onClick={() => handleCardClick(card)}
          >
            <Image
              src={card.background}
              alt={card.name}
              width={300}
              height={200}
              className={styles.carousel_img}
              priority={index === 0}
            />
            <Image
              src={card.profile}
              alt={`${card.name} profile`}
              width={40}
              height={40}
              className={styles.carousel_profile}
            />
            <p>{card.name}</p>
          </div>
        ))}
      </section>
    </section>
  );
}