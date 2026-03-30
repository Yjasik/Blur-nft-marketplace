'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";
import { EthIcon, OpenSeaIcon, XIcon, DiscordIcon, WebsiteIcon } from "@/components/icons";

// Типы данных для коллекции
interface CollectionData {
  name: string;
  floorPrice: number;
  change1D: number;
  change7D: number;
  volume1D: number;
  volume7D: number;
  owners: number;
  supply: number;
  profileImage: string;
  socialLinks: {
    opensea?: string;
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

interface CollectionHeroSectionProps {
  collectionAddress?: string;
  collectionData?: CollectionData;
}

export default function CollectionHeroSection({ 
  collectionAddress, 
  collectionData: propCollectionData 
}: CollectionHeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Данные по умолчанию для Azuki
  const defaultCollectionData: CollectionData = {
    name: "Azuki",
    floorPrice: 13.89,
    change1D: -5.12,
    change7D: -4.99,
    volume1D: 3277.46,
    volume7D: 10395.46,
    owners: 4915,
    supply: 10000,
    profileImage: "/assets/azuki_profile.webp",
    socialLinks: {
      opensea: "https://opensea.io/collection/azuki",
      twitter: "https://twitter.com/azukiofficial",
      discord: "https://discord.gg/azuki",
      website: "https://www.azuki.com/",
    },
  };

  useEffect(() => {
    setMounted(true);
    
    if (propCollectionData) {
      setCollectionData(propCollectionData);
      setIsLoading(false);
    } else {
      setCollectionData(defaultCollectionData);
      setIsLoading(false);
    }
  }, [propCollectionData, collectionAddress]);

  const formatPercentage = (value: number) => {
    const formatted = Math.abs(value).toFixed(2);
    return `${value > 0 ? '+' : ''}${formatted}%`;
  };

  const getChangeClass = (value: number) => {
    if (value > 0) return styles.green;
    if (value < 0) return styles.red;
    return '';
  };

  if (!mounted || isLoading) {
    return (
      <section className={styles.CollectionHeroSection}>
        <div className={styles.loadingState}>Loading collection data...</div>
      </section>
    );
  }

  if (!collectionData) {
    return null;
  }

  return (
    <section className={styles.CollectionHeroSection}>
      {/* Левая часть - аватар и информация */}
      <section className={styles.collectionInfo}>
        <Image
          src={collectionData.profileImage}
          alt={`${collectionData.name} profile`}
          width={60}
          height={60}
          className={styles.collectionProfile}
          priority
        />
        <section className={styles.collection_marketplace_title_icons}>
          <p className={styles.collectionName}>{collectionData.name}</p>
          <section className={styles.socialIcons}>
            {collectionData.socialLinks.opensea && (
              <Link href={collectionData.socialLinks.opensea} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
                <OpenSeaIcon />
              </Link>
            )}
            {collectionData.socialLinks.twitter && (
              <Link href={collectionData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
                <XIcon />
              </Link>
            )}
            {collectionData.socialLinks.discord && (
              <Link href={collectionData.socialLinks.discord} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
                <DiscordIcon />
              </Link>
            )}
            {collectionData.socialLinks.website && (
              <Link href={collectionData.socialLinks.website} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
                <WebsiteIcon />
              </Link>
            )}
          </section>
        </section>
      </section>

      {/* Правая часть - таблица с данными */}
      <section className={styles.collectionTableWrapper}>
        <table className={styles.collection_header_dataTable}>
          <thead>
            <tr className={styles.collection_header_dataTable_head_row}>
              <th>COLLECTION</th>
              <th>FLOOR PRICE</th>
              <th>1D CHANGE</th>
              <th>7D CHANGE</th>
              <th>1D VOLUME</th>
              <th>7D VOLUME</th>
              <th>OWNERS</th>
              <th>SUPPLY</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.collection_header_dataTable_body_row}>
              <td className={styles.collectionNameCell}>{collectionData.name}</td>
              <td className={styles.priceCell}>
                {collectionData.floorPrice}
                <EthIcon />
              </td>
              <td className={`${getChangeClass(collectionData.change1D)} ${styles.changeCell}`}>
                {formatPercentage(collectionData.change1D)}
              </td>
              <td className={`${getChangeClass(collectionData.change7D)} ${styles.changeCell}`}>
                {formatPercentage(collectionData.change7D)}
              </td>
              <td className={styles.volumeCell}>
                {collectionData.volume1D.toFixed(2)}
                <EthIcon />
              </td>
              <td className={styles.volumeCell}>
                {collectionData.volume7D.toFixed(2)}
                <EthIcon />
              </td>
              <td className={styles.ownersCell}>
                {collectionData.owners.toLocaleString('en-US')} ({Math.round((collectionData.owners / collectionData.supply) * 100)}%)
              </td>
              <td className={styles.supplyCell}>
                {collectionData.supply.toLocaleString('en-US')}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  );
}