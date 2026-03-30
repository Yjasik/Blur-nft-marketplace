// src/components/YjsCollectionPurchaseSection.tsx
'use client';

import { useEffect, useState } from "react";
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import styles from "@/styles/Home.module.css";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";
import MarketplaceABI from "@/contracts/abi/NFTMarketplace.json";

// Адреса контрактов
const YJS_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.YJS_MASTER;
const MARKETPLACE_ADDRESS = CONTRACT_ADDRESSES.NFT_MARKETPLACE;

// Функция для получения локального пути к изображению
const getLocalImageUrl = (tokenId: number): string => {
  const imageNumber = tokenId + 1;
  return `/nft-images/${imageNumber}.png`;
};

interface MarketItem {
  marketItemId: number;
  tokenId: number;
  nftContract: string;
  seller: string;
  price: bigint;
  sold: boolean;
  name?: string;
  imageUrl?: string;
  rarity?: string;
  description?: string;
  attributes?: { trait_type: string; value: string }[];
}

export default function YjsCollectionPurchaseSection() {
  const { address, isConnected } = useAccount();
  
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Контрактные операции для покупки
  const { 
    writeContract: buyNFT, 
    data: buyHash, 
    isPending: isBuyPending, 
    error: buyError,
    reset: resetBuyTransaction
  } = useContractWrite();
  
  const { isLoading: isConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Загрузка реальных данных
  useEffect(() => {
    async function fetchRealData() {
      if (!mounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Получаем активные листинги из маркетплейса
        let listings: any[] = [];
        
        try {
          const listingsResponse = await fetch(
            `/api/marketplace?collectionAddress=${YJS_CONTRACT_ADDRESS}`
          );
          
          if (listingsResponse.ok) {
            const listingsData = await listingsResponse.json();
            listings = listingsData.listings || [];
            console.log(`📋 Fetched ${listings.length} listings from marketplace`);
          } else {
            console.warn('Marketplace API returned error status:', listingsResponse.status);
          }
        } catch (apiError) {
          console.warn('Failed to fetch from marketplace API:', apiError);
        }
        
        // 2. Получаем метаданные всех NFT из коллекции
        const nftsResponse = await fetch(
          `/api/nft/contract?contractAddress=${YJS_CONTRACT_ADDRESS}&limit=100`
        );
        
        if (!nftsResponse.ok) {
          throw new Error(`Failed to fetch NFT metadata: ${nftsResponse.status}`);
        }
        
        const nftsData = await nftsResponse.json();
        const nfts = nftsData.nfts || [];
        
        console.log(`🖼️ Fetched ${nfts.length} NFTs from collection`);
        
        // 3. Создаем карту метаданных по tokenId
        const metadataMap = new Map<number, any>();
        nfts.forEach((nft: any) => {
          metadataMap.set(parseInt(nft.token_id), nft);
        });
        
        // 4. Если нет листингов, показываем пустой список
        if (listings.length === 0) {
          console.log('No active listings found');
          setMarketItems([]);
          setIsLoading(false);
          return;
        }
        
        // 5. Формируем marketItems из реальных листингов
        const items: MarketItem[] = listings
          .filter((listing: any) => !listing.sold)
          .map((listing: any) => {
            const metadata = metadataMap.get(listing.tokenId);
            
            let rarity = "Common";
            if (metadata?.attributes) {
              const rarityAttr = metadata.attributes.find(
                (attr: any) => attr.trait_type === "Rarity"
              );
              if (rarityAttr) {
                rarity = rarityAttr.value;
              }
            }
            
            return {
              marketItemId: listing.marketItemId,
              tokenId: listing.tokenId,
              nftContract: listing.nftContract,
              seller: listing.seller,
              price: BigInt(listing.price),
              sold: listing.sold,
              imageUrl: getLocalImageUrl(listing.tokenId),
              name: metadata?.name || `YJS Master #${listing.tokenId}`,
              rarity: rarity,
              description: metadata?.description,
              attributes: metadata?.attributes,
            };
          });
        
        console.log(`✅ Created ${items.length} market items`);
        setMarketItems(items);
        
      } catch (err: any) {
        console.error("Error loading marketplace data:", err);
        setError(err.message || "Failed to load listings");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRealData();
  }, [mounted, YJS_CONTRACT_ADDRESS]);

  // Сброс состояния покупки при успехе
  useEffect(() => {
    if (isBuySuccess && buyHash) {
      // Обновляем локальное состояние, отмечая проданные NFT
      setMarketItems(prev => prev.map(item => 
        purchasingId === item.tokenId 
          ? { ...item, sold: true }
          : item
      ));
      setPurchasingId(null);
      resetBuyTransaction();
    }
  }, [isBuySuccess, buyHash, purchasingId, resetBuyTransaction]);

  // Обработка ошибки покупки
  useEffect(() => {
    if (buyError) {
      console.error("Purchase error:", buyError);
      setError(`Purchase failed: ${buyError.message}`);
      setPurchasingId(null);
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
    const activeItems = marketItems.filter(item => !item.sold);
    if (selectedNFTs.length === activeItems.length) {
      setSelectedNFTs([]);
    } else {
      setSelectedNFTs(activeItems.map(item => item.tokenId.toString()));
    }
  };

  const handleBuyNFT = async (marketItem: MarketItem) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (marketItem.sold) {
      setError("This NFT has already been sold");
      return;
    }
    
    setPurchasingId(marketItem.tokenId);
    setError(null);
    
    try {
      buyNFT({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceABI.abi,
        functionName: "buyMarketItem",
        args: [BigInt(marketItem.marketItemId)],
        value: marketItem.price,
      });
    } catch (err: any) {
      console.error("Error buying NFT:", err);
      setError(`Failed to initiate purchase: ${err.message}`);
      setPurchasingId(null);
    }
  };

  const handleImageError = (tokenId: number) => {
    setImageErrors(prev => new Set(prev).add(tokenId));
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isCurrentUserSeller = (seller: string) => {
    return address && seller.toLowerCase() === address.toLowerCase();
  };

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

  if (error) {
    return (
      <section className={styles.collectionPurchaseSection}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const activeItems = marketItems.filter(item => !item.sold);
  
  if (activeItems.length === 0) {
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
          {marketItems.length > 0 && activeItems.length === 0 && (
            <p className={styles.soldOutNote}>All listed NFTs have been sold!</p>
          )}
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
                  checked={selectedNFTs.length === activeItems.length && activeItems.length > 0}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
              <th className={styles.listedCell}>{activeItems.length} LISTED</th>
              <th className={styles.rarityCell}>RARITY</th>
              <th className={styles.buyNowCell}>BUY NOW</th>
              <th className={styles.ownerCell}>OWNER</th>
              <th className={styles.actionCell}>ACTION</th>
             </tr>
          </thead>
          <tbody className={styles.collectionPurchaseSection_tbody}>
            {activeItems.map((item) => {
              const isSelected = selectedNFTs.includes(item.tokenId.toString());
              const isBuying = isBuyPending && purchasingId === item.tokenId;
              const isConfirmingTx = isConfirming && purchasingId === item.tokenId;
              const isOwner = isCurrentUserSeller(item.seller);
              const hasImageError = imageErrors.has(item.tokenId);
              
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
                      disabled={isOwner}
                    />
                  </td>
                  <td className={styles.nftInfoCell}>
                    <div className={styles.nftInfo}>
                      <div className={styles.nftImageWrapper}>
                        {!hasImageError ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className={styles.collection_thumbnail}
                            width={50}
                            height={50}
                            onError={() => handleImageError(item.tokenId)}
                          />
                        ) : (
                          <div className={styles.nftPlaceholderSmall}>
                            <span>YJ</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.nftDetails}>
                        <span className={styles.nftName}>
                          {item.name}
                        </span>
                        <span className={styles.nftTokenId}>Token ID: {item.tokenId}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.rarityCell}>
                    <span className={styles.rarityValue}>{item.rarity}</span>
                  </td>
                  <td className={styles.buyNowCell}>
                    <div className={styles.priceContainer}>
                      <span className={styles.priceValue}>{formatEther(item.price)}</span>
                      <EthIcon />
                    </div>
                  </td>
                  <td className={styles.ownerCell}>
                    <span className={styles.ownerAddress}>
                      {isOwner ? "You" : formatAddress(item.seller)}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    {isConnected && !isOwner && (
                      <button
                        onClick={() => handleBuyNFT(item)}
                        disabled={isBuying || isConfirmingTx}
                        className={styles.buyButton}
                      >
                        {isBuying || isConfirmingTx ? "..." : "Buy"}
                      </button>
                    )}
                    {isOwner && (
                      <span className={styles.ownerBadge}>Your listing</span>
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
            <button 
              className={styles.clearButton} 
              onClick={() => setSelectedNFTs([])}
            >
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