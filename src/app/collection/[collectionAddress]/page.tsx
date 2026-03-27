// app/collection/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import CollectionHeroSection from '@/components/CollectionHeroSection';
import CollectionPurchaseSection from '@/components/CollectionPurchaseSection';
import styles from '@/styles/Home.module.css';

interface CollectionData {
  address: string;
  name: string;
  symbol: string;
  // ... другие поля
}

export default function CollectionPage() {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загрузка данных коллекции
    const fetchCollectionData = async () => {
      try {
        // Здесь запрос к API или блокчейну
        // const response = await fetch(`/api/collections/${params.slug}`);
        // const data = await response.json();
        // setCollectionData(data);
        
        // Временные моковые данные
        setCollectionData({
          address: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
          name: "Azuki",
          symbol: "AZUKI",
        });
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionData();
  }, [params.slug]);

  if (isLoading) {
    return (
      <main className={styles.main}>
        <Header variant="collection" />
        <div className={styles.loadingState}>Loading collection...</div>
      </main>
    );
  }

  if (!collectionData) {
    return (
      <main className={styles.main}>
        <Header variant="collection" />
        <div className={styles.errorState}>Collection not found</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header variant="collection" />
      <CollectionHeroSection 
        collectionAddress={collectionData.address}
      />
      <CollectionPurchaseSection 
        contractAddress={collectionData.address}
      />
    </main>
  );
}