'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";

// SVG иконка поиска
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

// SVG иконка меню для мобильных
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

interface HeaderProps {
  variant?: 'default' | 'collection';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Выбираем класс в зависимости от варианта
  const headerClass = variant === 'collection' 
    ? styles.collectionHeader 
    : styles.header;

  if (!mounted) {
    return null; // Предотвращаем ошибки гидратации
  }

  return (
    <header className={headerClass}>
      {/* Логотип - крайний левый */}
      <div className={styles.logo}>
        <Link href="/">
          <Image 
            src="/assets/blurLogo.png" 
            alt="Blur Logo" 
            width={70} 
            height={40} 
            priority 
          />
        </Link>
      </div>
      
      {/* Десктопная навигация */}
      <nav className={styles.navItems}>
        <Link href="/collections" className={styles.link}>
          COLLECTIONS
        </Link>
        <Link href="/portfolio" className={styles.link}>
          PORTFOLIO
        </Link>
        <Link href="/airdrop" className={styles.link}>
          AIRDROP
        </Link>
      </nav>
      
      {/* Поиск */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            placeholder="Search collections and wallets"
            disabled
            className={styles.inputField}
          />
        </div>
      </div>
      
      {/* Растягивающийся отступ - толкает кнопку вправо */}
      <div className={styles.spacer}></div>
      
      {/* Кнопка подключения кошелька через RainbowKit */}
      <div className={styles.connectWrapper}>
        <ConnectButton 
          chainStatus="icon"
          accountStatus="avatar"
          showBalance={{
            largeScreen: true,
            smallScreen: false,
          }}
        />
      </div>

      {/* Кнопка мобильного меню */}
      <button 
        className={styles.mobileMenuBtn}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <MenuIcon />
      </button>

      {/* Мобильное меню (выпадающее) */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <Link 
            href="/collections" 
            className={styles.mobileLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            COLLECTIONS
          </Link>
          <Link 
            href="/portfolio" 
            className={styles.mobileLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            PORTFOLIO
          </Link>
          <Link 
            href="/airdrop" 
            className={styles.mobileLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            AIRDROP
          </Link>
        </div>
      )}
    </header>
  );
}