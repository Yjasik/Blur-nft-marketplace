// src/components/YjsCollectionPurchaseSection.tsx
'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useContractWrite, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import styles from "@/styles/Home.module.css";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

// Импортируем ABI
import MarketplaceABI from "@/contracts/abi/NFTMarketplace.json";

// Адреса контрактов
const YJS_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.YJS_MASTER;
const MARKETPLACE_ADDRESS = CONTRACT_ADDRESSES.NFT_MARKETPLACE;

interface MarketItem {
  tokenId: number;
  nftContract: string;
  seller: string;
  owner: string;
  price: bigint;
  sold: boolean;
  marketItemId?: number; // Добавляем marketItemId
}

export default function YjsCollectionPurchaseSection() {
  const { address, isConnected } = useAccount();
  
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Чтение активных лотов из маркетплейса
  const { data: listings, refetch, isLoading: isLoadingListings } = useReadContract({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
    abi: MarketplaceABI.abi,
    functionName: 'getActiveListings',
  });

  // Контрактные операции для покупки
  const { writeContract: buyNFT, data: buyHash, isPending: isBuyPending, error: buyError } = useContractWrite();
  const { isLoading: isConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Обработка полученных листингов
  useEffect(() => {
    if (listings && Array.isArray(listings)) {
      // Для каждого листинга нужно получить marketItemId
      // В текущей версии контракта marketItemId не возвращается
      // Поэтому используем индекс + 1 как временное решение
      const items = listings.map((listing: any, index: number) => ({
        tokenId: Number(listing.tokenId),
        nftContract: listing.nftContract,
        seller: listing.seller,
        owner: listing.owner,
        price: listing.price,
        sold: listing.sold,
        marketItemId: index + 1, // ВАЖНО: это временное решение!
      }));
      setMarketItems(items);
      setIsLoading(false);
    } else if (!isLoadingListings) {
      setIsLoading(false);
    }
  }, [listings, isLoadingListings]);

  // Обновляем список после успешной покупки
  useEffect(() => {
    if (isBuySuccess) {
      refetch();
      setSelectedNFTs([]);
    }
  }, [isBuySuccess, refetch]);

  // Показываем ошибку покупки если есть
  useEffect(() => {
    if (buyError) {
      console.error("Purchase error:", buyError);
      alert(`Failed to purchase: ${buyError.message}`);
    }
  }, [buyError]);

  const handleSelectNFT = (tokenId: string) => {
    setSelectedNFTs(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNFTs.length === marketItems.length) {
      setSelectedNFTs([]);
    } else {
      setSelectedNFTs(marketItems.map(item => item.tokenId.toString()));
    }
  };

  const handleBuyNFT = async (marketItem: MarketItem) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!marketItem.marketItemId) {
      alert("Invalid market item ID");
      return;
    }
    
    setPurchasingId(marketItem.tokenId);
    
    try {
      // buyMarketItem принимает marketItemId (ID лота, а не tokenId)
      buyNFT({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi,
        functionName: "buyMarketItem",
        args: [BigInt(marketItem.marketItemId)],
        value: marketItem.price,
      });
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert("Failed to purchase NFT");
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRandomRarity = () => Math.round(Math.random() * (10000 - 5000) + 5000);
  const getRandomBid = () => (Math.random() * (17.2 - 12.8) + 12.8).toFixed(2);
  const getRandomLastSale = () => (Math.random() * (17.6 - 12.34) + 12.34).toFixed(2);
  const getHeldCount = () => Math.round(Math.random() * (12 - 1) + 1);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <section className={styles.collectionPurchaseSection}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading available NFTs...</p>
        </div>
      </section>
    );
  }

  if (marketItems.length === 0) {
    return (
      <section className={styles.collectionPurchaseSection}>
        <div className={styles.collectionPurchaseSection_titles}>
          <p className={styles.activeTab}>ITEMS</p>
          <p>BIDS</p>
        </div>
        <div className={styles.emptyListings}>
          <div className={styles.emptyIcon}>🏷️</div>
          <h3>No NFTs Listed</h3>
          <p>There are no NFTs currently listed for sale in this collection.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.collectionPurchaseSection}>
      <div className={styles.collectionPurchaseSection_titles}>
        <p className={styles.activeTab}>ITEMS</p>
        <p>BIDS</p>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.collectionPurchaseSection_table}>
          <thead className={styles.collectionPurchaseSection_thead}>
            <tr className={styles.collectionPurchaseSection_thead_row}>
              <th className={styles.checkboxCell}>
                <input 
                  type="checkbox" 
                  checked={selectedNFTs.length === marketItems.length && marketItems.length > 0}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
              <th className={styles.listedCell}>{marketItems.length} LISTED</th>
              <th className={styles.rarityCell}>RARITY</th>
              <th className={styles.buyNowCell}>BUY NOW</th>
              <th className={styles.lastSaleCell}>LAST SALE</th>
              <th className={styles.topBidCell}>TOP BID</th>
              <th className={styles.ownerCell}>OWNER</th>
              <th className={styles.heldCell}>#HELD</th>
              <th className={styles.actionCell}>ACTION</th>
            </tr>
          </thead>
          <tbody className={styles.collectionPurchaseSection_tbody}>
            {marketItems.map((item) => {
              const isSelected = selectedNFTs.includes(item.tokenId.toString());
              const isBuying = isBuyPending && purchasingId === item.tokenId;
              
              return (
                <tr
                  key={item.tokenId}
                  className={`${styles.collectionPurchaseSection_tbody_row} ${isSelected ? styles.selectedRow : ''}`}
                >
                  <td className={styles.checkboxCell}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleSelectNFT(item.tokenId.toString())}
                      className={styles.checkbox}
                    />
                   </td>
                  <td className={styles.nftInfoCell}>
                    <div className={styles.nftInfo}>
                      <div className={styles.nftImageWrapper}>
                        <div className={styles.nftPlaceholderSmall}>
                          <span>YJ</span>
                        </div>
                      </div>
                      <div className={styles.nftDetails}>
                        <span className={styles.nftName}>
                          YJS Master #{item.tokenId}
                        </span>
                        <span className={styles.nftTokenId}>Token ID: {item.tokenId}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.rarityCell}>
                    <span className={styles.rarityValue}>{getRandomRarity().toLocaleString()}</span>
                  </td>
                  <td className={styles.buyNowCell}>
                    <div className={styles.priceContainer}>
                      <span className={styles.priceValue}>{formatEther(item.price)}</span>
                      <EthIcon />
                    </div>
                  </td>
                  <td className={styles.lastSaleCell}>
                    <div className={styles.priceContainer}>
                      <span>{getRandomLastSale()}</span>
                      <EthIcon />
                    </div>
                  </td>
                  <td className={styles.topBidCell}>
                    <div className={styles.priceContainer}>
                      <span>{getRandomBid()}</span>
                      <EthIcon />
                    </div>
                  </td>
                  <td className={styles.ownerCell}>
                    <span className={styles.ownerAddress}>
                      {formatAddress(item.seller)}
                    </span>
                  </td>
                  <td className={styles.heldCell}>
                    <span className={styles.heldCount}>{getHeldCount()}</span>
                  </td>
                  <td className={styles.actionCell}>
                    {isConnected && !item.sold && (
                      <button
                        onClick={() => handleBuyNFT(item)}
                        disabled={isBuying || isConfirming}
                        className={styles.buyButton}
                      >
                        {isBuying || isConfirming ? "..." : "Buy"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {isBuySuccess && buyHash && (
        <div className={styles.successMessage}>
          ✓ NFT purchased successfully!
          <a 
            href={`https://sepolia.etherscan.io/tx/${buyHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.txLink}
          >
            View transaction
          </a>
        </div>
      )}
      
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

// Компонент иконки ETH
const EthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
       className="ethIconSmall" 
       style={{ width: '0.7rem', height: '0.7rem', display: 'inline-block', marginLeft: '0.2rem' }}>
    <path d="M12 1.5L4.5 12 12 15.75 19.5 12 12 1.5zM12 16.5L4.5 12 12 22.5 19.5 12 12 16.5z" />
  </svg>
);