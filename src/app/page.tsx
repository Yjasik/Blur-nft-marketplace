// app/page.tsx
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import styles from '@/styles/Home.module.css';  // ← Импорт

export default function Home() {
  return (
    <main className={styles.main}>  {/* ← Используем styles.main */}
      <Header />
      <HeroSection />
    </main>
  );
}