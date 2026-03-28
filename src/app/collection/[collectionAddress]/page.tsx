// app/collection/[collectionAddress]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import Header from '@/components/Header';
import YjsCollectionHeroSection from '@/components/YjsCollectionHeroSection';
import CollectionPurchaseSection from '@/components/CollectionPurchaseSection';
import styles from '@/styles/Home.module.css';

// ABI для чтения базовой информации о коллекции
const ERC721_BASIC_ABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Адрес вашего контракта YJS Master
const YJS_CONTRACT_ADDRESS = "0x2c14Ba2eA0bC4D8770550a59f238092AEcC260a6";

interface CollectionData {
  address: string;
  name: string;
  symbol: string;
  totalSupply?: number;
}

export default function CollectionPage() {
  const params = useParams();
  const collectionAddress = params?.collectionAddress as string;
  
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isYJSCollection, setIsYJSCollection] = useState(false);

  // Чтение имени из контракта
  const { data: contractName, isLoading: nameLoading } = useReadContract({
    address: collectionAddress as `0x${string}`,
    abi: ERC721_BASIC_ABI,
    functionName: 'name',
  });

  // Чтение символа из контракта
  const { data: contractSymbol, isLoading: symbolLoading } = useReadContract({
    address: collectionAddress as `0x${string}`,
    abi: ERC721_BASIC_ABI,
    functionName: 'symbol',
  });

  // Чтение общего количества NFT
  const { data: totalSupply, isLoading: supplyLoading } = useReadContract({
    address: collectionAddress as `0x${string}`,
    abi: ERC721_BASIC_ABI,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    // Проверяем, является ли это коллекцией YJS Master
    if (collectionAddress?.toLowerCase() === YJS_CONTRACT_ADDRESS.toLowerCase()) {
      setIsYJSCollection(true);
    } else {
      setIsYJSCollection(false);
    }
  }, [collectionAddress]);

  useEffect(() => {
    if (!nameLoading && !symbolLoading && !supplyLoading) {
      if (contractName) {
        setCollectionData({
          address: collectionAddress,
          name: contractName as string,
          symbol: contractSymbol as string || 'UNKNOWN',
          totalSupply: totalSupply ? Number(totalSupply) : undefined,
        });
      }
      setIsLoading(false);
    }
  }, [contractName, contractSymbol, totalSupply, nameLoading, symbolLoading, supplyLoading, collectionAddress]);

  if (isLoading) {
    return (
      <main className={styles.main}>
        <Header variant="collection" />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading collection...</p>
        </div>
      </main>
    );
  }

  if (!collectionData) {
    return (
      <main className={styles.main}>
        <Header variant="collection" />
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Collection not found</h2>
          <p>The collection address {collectionAddress?.slice(0, 10)}... may be invalid</p>
        </div>
      </main>
    );
  }

  // Если это коллекция YJS Master, используем специальный компонент
  if (isYJSCollection) {
    return (
      <main className={styles.main}>
        <Header variant="collection" />
        <YjsCollectionHeroSection contractAddress={collectionAddress as `0x${string}`} />
        <CollectionPurchaseSection 
          contractAddress={collectionAddress}
        />
      </main>
    );
  }

  // Для других коллекций используем общий компонент
  return (
    <main className={styles.main}>
      <Header variant="collection" />
      <div className={styles.collectionInfo}>
        <h1 className={styles.collectionTitle}>{collectionData.name}</h1>
        <p className={styles.collectionSymbol}>{collectionData.symbol}</p>
        <p className={styles.collectionAddress}>
          Address: {collectionData.address}
        </p>
        {collectionData.totalSupply !== undefined && (
          <p className={styles.collectionSupply}>
            Total Supply: {collectionData.totalSupply.toLocaleString()}
          </p>
        )}
      </div>
      <CollectionPurchaseSection 
        contractAddress={collectionAddress}
      />
    </main>
  );
}