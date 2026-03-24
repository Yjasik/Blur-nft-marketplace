'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TrendingSection from '@/components/TrendingSection';  // ← Добавляем импорт
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [backgroundImage, setBackgroundImage] = useState('/assets/azuki.png');
  const [collectionName, setCollectionName] = useState('Azuki');
  const [collectionAuthor, setCollectionAuthor] = useState('BY CHIRU LABS');

  const handleBackgroundChange = (newImage: string, newName: string, newAuthor: string) => {
    setBackgroundImage(newImage);
    setCollectionName(newName);
    setCollectionAuthor(newAuthor);
  };

  return (
    <main 
      className={styles.main}
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.884), rgba(255, 255, 255, 0)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      <HeroSection 
        onCardClick={handleBackgroundChange}
        collectionName={collectionName}
        collectionAuthor={collectionAuthor}
      />
      <TrendingSection />  {/* ← Добавляем секцию с трендами */}
    </main>
  );
}