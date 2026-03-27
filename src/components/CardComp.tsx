'use client';

import { useState } from "react";
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

// ABI для маркетплейса (нужно добавить)
const MARKETPLACE_ABI = [
  {
    name: "createMarketItem",
    type: "function",
    inputs: [
      { name: "nftContract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

interface CardCompProps {
  nft: {
    token_id: string;
    contract_address: string;
    name: string;
    image_url: string | null;
    metadata?: any;
  };
  marketplaceAddress: `0x${string}`;
}

export default function CardComp({ nft, marketplaceAddress }: CardCompProps) {
  const { isConnected } = useAccount();
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { writeContract, data: hash, isPending } = useContractWrite();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Формируем URL изображения
  const getImageUrl = () => {
    if (imageError || !nft.image_url) return null;
    
    if (nft.image_url.includes("ipfs://")) {
      const ipfsHash = nft.image_url.split("ipfs://")[1];
      return `https://ipfs.io/ipfs/${ipfsHash}`;
    }
    return nft.image_url;
  };

  const imageUrl = getImageUrl();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleListForSale = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    setIsLoading(true);
    
    try {
      writeContract({
        address: marketplaceAddress,
        abi: MARKETPLACE_ABI,
        functionName: "createMarketItem",
        args: [
          nft.contract_address as `0x${string}`,
          BigInt(nft.token_id),
          parseEther(price),
        ],
      });
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Failed to list NFT for sale");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.nftCard}>
        <div className={styles.nftImageContainer}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={nft.name}
              width={300}
              height={300}
              className={styles.nftImage}
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className={styles.nftPlaceholder}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect width="80" height="80" fill="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/>
                <text x="40" y="48" textAnchor="middle" fill="white" fontSize="14">NFT</text>
              </svg>
            </div>
          )}
        </div>
        <div className={styles.nftInfo}>
          <h3 className={styles.nftName}>{nft.name}</h3>
        </div>
      </div>
      
      <div className={styles.sellSection}>
        <input
          type="number"
          placeholder="Price in ETH"
          value={price}
          onChange={handlePriceChange}
          className={styles.inputField_amount}
          disabled={isPending || isConfirming}
          step="0.01"
          min="0"
        />
        <button
          onClick={handleListForSale}
          className={styles.sell_btn}
          disabled={isPending || isConfirming || !isConnected}
        >
          {isPending || isConfirming ? "Processing..." : "LIST FOR SALE"}
        </button>
      </div>
      
      {isSuccess && (
        <div className={styles.successMessage}>
          ✓ NFT listed for sale! Transaction: {hash?.slice(0, 10)}...
        </div>
      )}
    </div>
  );
}