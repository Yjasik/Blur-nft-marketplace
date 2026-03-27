// contracts/src/NFTMarketplace.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, ReentrancyGuard {
    // Структура для хранения информации о лоте
    struct MarketItem {
        uint256 tokenId;
        address nftContract;
        address seller;
        address owner;
        uint256 price;
        bool sold;
    }
    
    // ID для каждого лота
    uint256 private _marketItemIds;
    
    // Маппинг для хранения всех лотов
    mapping(uint256 => MarketItem) private _marketItems;
    
    // Маппинг для отслеживания активных лотов по NFT
    mapping(address => mapping(uint256 => bool)) private _activeListings;
    
    // Конструктор
    constructor() Ownable(msg.sender) ReentrancyGuard() {
        // Инициализация
    }
    
    // События
    event MarketItemCreated(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );
    
    event MarketItemSold(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    
    event MarketItemCancelled(
        uint256 indexed marketItemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );
    
    // Создание лота на продажу
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(!_activeListings[nftContract][tokenId], "Item already listed");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "You don't own this NFT");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Marketplace not approved");
        
        _marketItemIds++;
        uint256 marketItemId = _marketItemIds;
        
        _marketItems[marketItemId] = MarketItem({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: msg.sender,
            owner: address(0),
            price: price,
            sold: false
        });
        
        _activeListings[nftContract][tokenId] = true;
        
        emit MarketItemCreated(
            marketItemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }
    
    // Покупка NFT
    function buyMarketItem(uint256 marketItemId) external payable nonReentrant {
        MarketItem storage item = _marketItems[marketItemId];
        
        require(item.price > 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(msg.value >= item.price, "Insufficient payment");
        
        address seller = item.seller;
        
        // Переводим NFT покупателю
        IERC721 nft = IERC721(item.nftContract);
        nft.safeTransferFrom(seller, msg.sender, item.tokenId);
        
        // Обновляем статус лота
        item.sold = true;
        item.owner = msg.sender;
        _activeListings[item.nftContract][item.tokenId] = false;
        
        // Переводим средства продавцу
        payable(seller).transfer(item.price);
        
        // Возвращаем излишек покупателю
        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }
        
        emit MarketItemSold(
            marketItemId,
            item.nftContract,
            item.tokenId,
            seller,
            msg.sender,
            item.price
        );
    }
    
    // Отмена лота
    function cancelMarketItem(uint256 marketItemId) external nonReentrant {
        MarketItem storage item = _marketItems[marketItemId];
        
        require(item.seller == msg.sender, "Not the seller");
        require(!item.sold, "Item already sold");
        
        _activeListings[item.nftContract][item.tokenId] = false;
        delete _marketItems[marketItemId];
        
        emit MarketItemCancelled(
            marketItemId,
            item.nftContract,
            item.tokenId,
            msg.sender
        );
    }
    
    // Получение информации о лоте
    function getMarketItem(uint256 marketItemId) external view returns (
        uint256 tokenId,
        address nftContract,
        address seller,
        address owner,
        uint256 price,
        bool sold
    ) {
        MarketItem memory item = _marketItems[marketItemId];
        return (
            item.tokenId,
            item.nftContract,
            item.seller,
            item.owner,
            item.price,
            item.sold
        );
    }
    
    // Получение всех активных лотов
    function getActiveListings() external view returns (MarketItem[] memory) {
        uint256 activeCount = 0;
        
        // Подсчитываем активные лоты
        for (uint256 i = 1; i <= _marketItemIds; i++) {
            if (!_marketItems[i].sold && _marketItems[i].price > 0) {
                activeCount++;
            }
        }
        
        // Собираем активные лоты
        MarketItem[] memory activeItems = new MarketItem[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= _marketItemIds; i++) {
            if (!_marketItems[i].sold && _marketItems[i].price > 0) {
                activeItems[index] = _marketItems[i];
                index++;
            }
        }
        
        return activeItems;
    }
}