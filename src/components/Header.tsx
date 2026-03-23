'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

// SVG иконка поиска вместо @web3uikit/icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export default function Header() {
  return (
    <section className={styles.header}>
      <section className={styles.logo}>
        <Link href="/">
          <Image src="/assets/blurLogo.png" alt="Blur Logo" width={70} height={40} />
        </Link>
      </section>
      
      <section className={styles.nav}>
        <section className={styles.nav_items}>
          <Link href="/collections" className={styles.link}>
            <p>COLLECTIONS</p>
          </Link>
          <Link href="/portfolio" className={styles.link}>
            <p>PORTFOLIO</p>
          </Link>
          <Link href="/airdrop" className={styles.link}>
            <p>AIRDROP</p>
          </Link>
        </section>
        
        <section className={styles.searchSection}>
          <section>
            <span>
              <SearchIcon />
            </span>
            <input
              placeholder="Search collections and wallets"
              disabled
              className={styles.inputField}
            />
          </section>
        </section>
        
        <div className={styles.customConnectButton}>
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
    </section>
  );
}