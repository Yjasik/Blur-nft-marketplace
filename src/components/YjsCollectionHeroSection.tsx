'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useReadContract } from 'wagmi';
import styles from "@/styles/Home.module.css";
import { EthIcon, OpenSeaIcon, XIcon, DiscordIcon, WebsiteIcon, YJSProfileSVG } from "@/components/icons";
import MyNftABI from '@/contracts/abi/MyNft.json';
import { CONTRACT_ADDRESSES } from '@/contracts/addresses';

// ABI контракта YJS Master
const YJS_MASTER_ABI = MyNftABI.abi;

// Данные для коллекции YJS Master
const COLLECTION_DATA = {
  name: "YJS Master",
  symbol: "YJS",
  floorPrice: 0.05,
  change1D: 31.12,
  change7D: 58.43,
  volume1D: 8.15,
  volume7D: 75.81,
  owners: 1356,
  supply: 10000,
  socialLinks: {
    opensea: "https://opensea.io/collection/yjs-master",
    twitter: "https://twitter.com/yjsmaster",
    discord: "https://discord.gg/yjsmaster",
    website: "https://yjsmaster.com/",
  }
};

interface YjsCollectionHeroSectionProps {
  contractAddress?: `0x${string}`;
}

export default function YjsCollectionHeroSection({ 
  contractAddress = CONTRACT_ADDRESSES.YJS_MASTER 
}: YjsCollectionHeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [collectionData, setCollectionData] = useState(COLLECTION_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Чтение имени из контракта
  const { data: contractName, isLoading: nameLoading } = useReadContract({
    address: contractAddress,
    abi: YJS_MASTER_ABI,
    functionName: 'name',
  });

  // Чтение символа из контракта
  const { data: contractSymbol, isLoading: symbolLoading } = useReadContract({
    address: contractAddress,
    abi: YJS_MASTER_ABI,
    functionName: 'symbol',
  });

  // Чтение общего количества NFT
  const { data: totalSupply, isLoading: supplyLoading } = useReadContract({
    address: contractAddress,
    abi: YJS_MASTER_ABI,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!nameLoading && contractName) {
      setCollectionData(prev => ({
        ...prev,
        name: contractName as string
      }));
    }
    if (!symbolLoading && contractSymbol) {
      setCollectionData(prev => ({
        ...prev,
        symbol: contractSymbol as string
      }));
    }
    if (!nameLoading && !symbolLoading && !supplyLoading) {
      setIsLoading(false);
    }
  }, [contractName, contractSymbol, totalSupply, nameLoading, symbolLoading, supplyLoading]);

  const getChangeClass = (value: number) => {
    if (value > 0) return styles.green;
    if (value < 0) return styles.red;
    return '';
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!mounted || isLoading) {
    return (
      <section className={styles.CollectionHeroSection}>
        <div className={styles.loadingState}>Loading collection data...</div>
      </section>
    );
  }

  return (
    <section className={styles.CollectionHeroSection}>
      {/* Левая секция - аватар и информация */}
      <div className={styles.collectionInfo}>
        <div className={styles.collectionAvatar}>
          <YJSProfileSVG />
        </div>
        <div className={styles.collection_marketplace_title_icons}>
          <p className={styles.collectionName}>{collectionData.name}</p>
          <p className={styles.collectionSymbol}>{collectionData.symbol}</p>
          <div className={styles.socialIcons}>
            <Link href={collectionData.socialLinks.opensea} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
              <OpenSeaIcon />
            </Link>
            <Link href={collectionData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
              <XIcon />
            </Link>
            <Link href={collectionData.socialLinks.discord} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
              <DiscordIcon />
            </Link>
            <Link href={collectionData.socialLinks.website} target="_blank" rel="noopener noreferrer" className={styles.collection_icons}>
              <WebsiteIcon />
            </Link>
          </div>
        </div>
      </div>

      {/* Правая секция - таблица с метриками */}
      <div className={styles.collectionTableWrapper}>
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
                {collectionData.volume1D}
                <EthIcon />
              </td>
              <td className={styles.volumeCell}>
                {collectionData.volume7D}
                <EthIcon />
              </td>
              <td className={styles.ownersCell}>
                {collectionData.owners.toLocaleString()} ({Math.round((collectionData.owners / collectionData.supply) * 100)}%)
              </td>
              <td className={styles.supplyCell}>
                {totalSupply ? Number(totalSupply).toLocaleString() : '0'} / {collectionData.supply.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}