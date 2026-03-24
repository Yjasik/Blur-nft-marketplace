'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

// SVG иконка поиска
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export default function Header() {
  return (
    <section className={styles.header}>
      {/* Логотип - крайний левый */}
      <div className={styles.logo}>
        <Link href="/">
          <Image src="/assets/blurLogo.png" alt="Blur Logo" width={70} height={40} />
        </Link>
      </div>
      
      {/* Навигация - сразу после логотипа */}
      <div className={styles.navItems}>
        <Link href="/collections" className={styles.link}>
          COLLECTIONS
        </Link>
        <Link href="/portfolio" className={styles.link}>
          PORTFOLIO
        </Link>
        <Link href="/airdrop" className={styles.link}>
          AIRDROP
        </Link>
      </div>
      
      {/* Поиск - после навигации */}
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
      
      {/* Кнопка подключения - крайний правый */}
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
    </section>
  );
}