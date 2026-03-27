'use client';

import PortfolioData from '@/components/PortfolioData';
import Header from '@/components/Header';
import styles from '@/styles/Home.module.css';

export default function PortfolioPage() {
  return (
    <main className={styles.main}>
      <Header />
      <PortfolioData />
    </main>
  );
}