'use client';

import Link from "next/link";
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { sepolia } from 'wagmi/chains';
import styles from "@/styles/Home.module.css";

// SVG иконка ETH (уменьшенная)
const EthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
       className="ethIconSmall" 
       style={{ width: '0.7rem', height: '0.7rem', display: 'inline-block', marginLeft: '0.2rem' }}>
    <path d="M12 1.5L4.5 12 12 15.75 19.5 12 12 1.5zM12 16.5L4.5 12 12 22.5 19.5 12 12 16.5z" />
  </svg>
);

// Адрес контракта YJS Master
const YJS_CONTRACT_ADDRESS = "0x2c14Ba2eA0bC4D8770550a59f238092AEcC260a6";

// Данные для таблицы (в реальном приложении будут из API/блокчейна)
const TRENDING_DATA = [
  {
    name: "Azuki",
    floorPrice: 0.70,
    change1D: -5.12,
    change7D: -4.99,
    volume1D: 20.12,
    volume7D: 81.55,
    owners: 4449,
    supply: 10000,
    contractAddress: "0xed5af388653567af2f388e6224dc7c4b3241c544",
    link: "/collection/0xed5af388653567af2f388e6224dc7c4b3241c544"
  },
  {
    name: "Bored Ape Yacht Club",
    floorPrice: 67.90,
    change1D: -2.91,
    change7D: -3.57,
    volume1D: 37.27,
    volume7D: 238.65,
    owners: 5647,
    supply: 9998,
    contractAddress: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    link: "/collection/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
  },
  {
    name: "YJS Master",
    floorPrice: 0.05,
    change1D: 31.12,
    change7D: 58.43,
    volume1D: 8.15,
    volume7D: 75.81,
    owners: 1356,
    supply: 10000,
    contractAddress: YJS_CONTRACT_ADDRESS,
    link: `/collection/${YJS_CONTRACT_ADDRESS}`
  },
  {
    name: "Moonbirds",
    floorPrice: 6.51,
    change1D: 7.08,
    change7D: 6.91,
    volume1D: 10.43,
    volume7D: 71.81,
    owners: 3421,
    supply: 9999,
    contractAddress: "0x23581767a106ae21c074b2276d25e5c3e136a68b",
    link: "/collection/0x23581767a106ae21c074b2276d25e5c3e136a68b"
  },
  {
    name: "Vee Friends",
    floorPrice: 4.80,
    change1D: 11.63,
    change7D: -11.76,
    volume1D: 4.19,
    volume7D: 22.09,
    owners: 4659,
    supply: 10255,
    contractAddress: "0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb",
    link: "/collection/0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb"
  }
];

type TrendingSectionProps = {
  activeTab?: 'trending' | 'top';
  onTabChange?: (tab: 'trending' | 'top') => void;
};

export default function TrendingSection({ activeTab = 'trending', onTabChange }: TrendingSectionProps) {
  
  const handleTabClick = (tab: 'trending' | 'top') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Функция для форматирования процентов
  const formatPercentage = (value: number) => {
    const formatted = value.toFixed(2);
    return `${value > 0 ? '+' : ''}${formatted}%`;
  };

  // Функция для определения класса цвета
  const getChangeClass = (value: number) => {
    if (value > 0) return styles.green;
    if (value < 0) return styles.red;
    return '';
  };

  return (
    <section className={styles.trendingSection_container}>
      {/* Вкладки */}
      <div className={styles.trendingSection_header}>
        <h3 
          className={activeTab === 'trending' ? styles.active : ''}
          onClick={() => handleTabClick('trending')}
        >
          Trending
        </h3>
        <h3 
          className={activeTab === 'top' ? styles.active : ''}
          onClick={() => handleTabClick('top')}
        >
          Top
        </h3>
      </div>

      {/* Таблица */}
      <div className={styles.trendingTableWrapper}>
        <table className={styles.trendingTable}>
          <thead>
            <tr className={styles.tableHead_row}>
              <th className={styles.firstChild}>COLLECTION</th>
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
            {TRENDING_DATA.map((item, index) => (
              <tr key={index} className={styles.tableBody_row}>
                <td className={styles.collectionCell}>
                  <Link href={item.link} className={styles.collectionLink}>
                    {item.name}
                  </Link>
                </td>
                <td>
                  {item.floorPrice}
                  <EthIcon />
                </td>
                <td className={getChangeClass(item.change1D)}>
                  {formatPercentage(item.change1D)}
                </td>
                <td className={getChangeClass(item.change7D)}>
                  {formatPercentage(item.change7D)}
                </td>
                <td>
                  {item.volume1D.toFixed(2)}
                  <EthIcon />
                </td>
                <td>
                  {item.volume7D.toFixed(2)}
                  <EthIcon />
                </td>
                <td>
                  {item.owners.toLocaleString('en-US')} ({Math.round((item.owners / item.supply) * 100)}%)
                </td>
                <td>{item.supply.toLocaleString('en-US')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}