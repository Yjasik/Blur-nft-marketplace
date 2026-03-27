'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { formatEther, erc721Abi } from "viem";
import styles from "@/styles/Home.module.css";

// SVG иконка ETH
const EthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
       className="ethIconSmall" 
       style={{ width: '0.7rem', height: '0.7rem', display: 'inline-block', marginLeft: '0.2rem' }}>
    <path d="M12 1.5L4.5 12 12 15.75 19.5 12 12 1.5zM12 16.5L4.5 12 12 22.5 19.5 12 12 16.5z" />
  </svg>
);

// Типы данных
interface NFTMetadata {
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTData {
  tokenId: string;
  metadata: NFTMetadata;
  minter_address: string;
  price?: string;
  owner?: string;
}

interface CollectionPurchaseSectionProps {
  contractAddress?: string;
  onBuyNFT?: (tokenId: string, price: string) => void;
  onPlaceBid?: (tokenId: string, bidAmount: string) => void;
}

export default function CollectionPurchaseSection({ 
  contractAddress = "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
  onBuyNFT,
  onPlaceBid
}: CollectionPurchaseSectionProps) {
  const { address: userAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Чтение имени коллекции
  const { data: collectionName } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: erc721Abi,
    functionName: 'name',
  });

  // Чтение символа коллекции
  const { data: collectionSymbol } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: erc721Abi,
    functionName: 'symbol',
  });

  useEffect(() => {
    const fetchNFTData = async () => {
      if (!contractAddress) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // В реальном приложении здесь должен быть запрос к вашему API
        // Для демонстрации используем моковые данные
        const mockNFTs: NFTData[] = Array.from({ length: 20 }, (_, i) => ({
          tokenId: (i + 1).toString(),
          metadata: {
            name: `${collectionName || 'NFT'} #${i + 1}`,
            image: `/assets/nft-placeholder-${(i % 5) + 1}.png`,
            attributes: [
              { trait_type: "Rarity", value: ["Common", "Rare", "Epic", "Legendary"][Math.floor(Math.random() * 4)] },
              { trait_type: "Background", value: ["Blue", "Red", "Green", "Purple"][Math.floor(Math.random() * 4)] }
            ]
          },
          minter_address: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
          price: (Math.random() * (5 - 0.5) + 0.5).toFixed(4),
          owner: `0x${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`
        }));
        
        setNfts(mockNFTs);
      } catch (err) {
        console.error("Error fetching NFT data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch NFT data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTData();
  }, [contractAddress, collectionName]);

  // Функция для получения случайной цены
  const getRandomPrice = () => {
    return (Math.random() * (17.6 - 12.34) + 12.34).toFixed(2);
  };

  // Функция для получения случайной ставки
  const getRandomBid = () => {
    return (Math.random() * (17.2 - 12.8) + 12.8).toFixed(2);
  };

  // Функция для получения случайной редкости
  const getRandomRarity = () => {
    return Math.round(Math.random() * (10000 - 5000) + 5000);
  };

  // Функция для получения количества NFT у владельца
  const getHeldCount = () => {
    return Math.round(Math.random() * (12 - 1) + 1);
  };

  // Обработчик выбора NFT
  const handleSelectNFT = (tokenId: string) => {
    setSelectedNFTs(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  // Обработчик выбора всех NFT
  const handleSelectAll = () => {
    if (selectedNFTs.length === nfts.length) {
      setSelectedNFTs([]);
    } else {
      setSelectedNFTs(nfts.map(nft => nft.tokenId));
    }
  };

  // Обработчик покупки
  const handleBuyNFT = (tokenId: string, price: string) => {
    if (onBuyNFT) {
      onBuyNFT(tokenId, price);
    } else {
      console.log(`Buy NFT ${tokenId} for ${price} ETH`);
      // Здесь будет логика покупки через контракт
    }
  };

  // Обработчик ставки
  const handlePlaceBid = (tokenId: string, bidAmount: string) => {
    if (onPlaceBid) {
      onPlaceBid(tokenId, bidAmount);
    } else {
      console.log(`Place bid ${bidAmount} ETH on NFT ${tokenId}`);
      // Здесь будет логика ставки через контракт
    }
  };

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <section className={styles.collectionPurchaseSection}>
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Loading NFTs...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.collectionPurchaseSection}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>Error: {error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.collectionPurchaseSection}>
      <section className={styles.collectionPurchaseSection_titles}>
        <p className={styles.activeTab}>ITEMS</p>
        <p>BIDS</p>
      </section>
      
      <div className={styles.tableWrapper}>
        <table className={styles.collectionPurchaseSection_table}>
          <thead className={styles.collectionPurchaseSection_thead}>
            <tr className={styles.collectionPurchaseSection_thead_row}>
              <th className={styles.checkboxCell}>
                <input 
                  type="checkbox" 
                  checked={selectedNFTs.length === nfts.length && nfts.length > 0}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
              <th className={styles.listedCell}>{nfts.length} LISTED</th>
              <th className={styles.rarityCell}>RARITY</th>
              <th className={styles.buyNowCell}>BUY NOW</th>
              <th className={styles.lastSaleCell}>LAST SALE</th>
              <th className={styles.topBidCell}>TOP BID</th>
              <th className={styles.ownerCell}>OWNER</th>
              <th className={styles.heldCell}>#HELD</th>
            </tr>
          </thead>
          <tbody className={styles.collectionPurchaseSection_tbody}>
            {nfts.map((nft, index) => {
              const buyNowPrice = nft.price || getRandomPrice();
              const lastSalePrice = getRandomPrice();
              const topBid = getRandomBid();
              const rarity = getRandomRarity();
              const heldCount = getHeldCount();
              const isSelected = selectedNFTs.includes(nft.tokenId);
              
              return (
                <tr
                  className={`${styles.collectionPurchaseSection_tbody_row} ${isSelected ? styles.selectedRow : ''}`}
                  key={nft.tokenId}
                >
                  <td className={styles.checkboxCell}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectNFT(nft.tokenId)}
                      className={styles.checkbox}
                    />
                  </td>
                  <td className={styles.nftInfoCell}>
                    <div className={styles.nftInfo}>
                      <Image
                        src={nft.metadata.image}
                        alt={nft.metadata.name}
                        width={50}
                        height={50}
                        className={styles.collection_thumbnail}
                        onError={(e) => {
                          // Если изображение не загрузилось, используем плейсхолдер
                          (e.target as HTMLImageElement).src = '/assets/nft-placeholder.png';
                        }}
                      />
                      <div className={styles.nftDetails}>
                        <span className={styles.nftName}>{nft.metadata.name}</span>
                        {nft.metadata.attributes && (
                          <span className={styles.nftAttributes}>
                            {nft.metadata.attributes[0]?.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.rarityCell}>
                    <span className={styles.rarityValue}>{rarity.toLocaleString()}</span>
                  </td>
                  <td className={styles.buyNowCell}>
                    <div className={styles.priceContainer}>
                      <span className={styles.priceValue}>{buyNowPrice}</span>
                      <EthIcon />
                      {isConnected && (
                        <button
                          onClick={() => handleBuyNFT(nft.tokenId, buyNowPrice)}
                          className={styles.buyButton}
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  </td>
                  <td className={styles.lastSaleCell}>
                    <div className={styles.priceContainer}>
                      <span>{lastSalePrice}</span>
                      <EthIcon />
                    </div>
                  </td>
                  <td className={styles.topBidCell}>
                    <div className={styles.priceContainer}>
                      <span>{topBid}</span>
                      <EthIcon />
                      {isConnected && (
                        <button
                          onClick={() => handlePlaceBid(nft.tokenId, topBid)}
                          className={styles.bidButton}
                        >
                          Bid
                        </button>
                      )}
                    </div>
                  </td>
                  <td className={styles.ownerCell}>
                    <span className={styles.ownerAddress}>{nft.owner || nft.minter_address}</span>
                  </td>
                  <td className={styles.heldCell}>
                    <span className={styles.heldCount}>{heldCount}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Информация о выбранных NFT */}
      {selectedNFTs.length > 0 && (
        <div className={styles.selectedActions}>
          <span>{selectedNFTs.length} NFT(s) selected</span>
          <div className={styles.actionButtons}>
            <button className={styles.bulkBuyButton}>
              Bulk Buy ({selectedNFTs.length})
            </button>
            <button className={styles.clearButton} onClick={() => setSelectedNFTs([])}>
              Clear
            </button>
          </div>
        </div>
      )}
    </section>
  );
}