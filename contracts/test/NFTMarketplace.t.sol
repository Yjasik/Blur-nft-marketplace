// test/NFTMarketplace.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {NFTMarketplace} from "../src/NFTMarketplace.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Мок-контракт NFT для тестирования
contract MockNFT is ERC721 {
    uint256 public nextTokenId;
    
    constructor() ERC721("MockNFT", "MNFT") {}
    
    function mint(address to) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
    
    function mintWithId(address to, uint256 tokenId) external {
        _mint(to, tokenId);
        if (tokenId >= nextTokenId) {
            nextTokenId = tokenId + 1;
        }
    }
}

contract NFTMarketplaceTest is Test {
    NFTMarketplace public marketplace;
    MockNFT public nft;
    
    address public seller = address(0x123);
    address public buyer = address(0x456);
    address public anotherUser = address(0x789);
    
    uint256 public constant PRICE = 1 ether;
    
    function setUp() public {
        // Деплоим контракты
        marketplace = new NFTMarketplace();
        nft = new MockNFT();
    }
    
    function testCreateMarketItem() public {
        uint256 tokenId = nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
        
        vm.prank(seller);
        marketplace.createMarketItem(address(nft), tokenId, PRICE);
        
        (
            uint256 returnedTokenId,
            address nftContract,
            address sellerAddr,
            address owner,
            uint256 price,
            bool sold
        ) = marketplace.getMarketItem(1);
        
        assertEq(returnedTokenId, tokenId);
        assertEq(nftContract, address(nft));
        assertEq(sellerAddr, seller);
        assertEq(owner, address(0));
        assertEq(price, PRICE);
        assertFalse(sold);
    }
    
    function testBuyMarketItem() public {
        uint256 tokenId = nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
        
        vm.prank(seller);
        marketplace.createMarketItem(address(nft), tokenId, PRICE);
        
        vm.deal(buyer, PRICE);
        vm.prank(buyer);
        marketplace.buyMarketItem{value: PRICE}(1);
        
        assertEq(nft.ownerOf(tokenId), buyer);
        
        (
            ,
            ,
            ,
            address owner,
            ,
            bool sold
        ) = marketplace.getMarketItem(1);
        
        assertEq(owner, buyer);
        assertTrue(sold);
    }
    
    function testCannotBuyWithInsufficientFunds() public {
        uint256 tokenId = nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
        
        vm.prank(seller);
        marketplace.createMarketItem(address(nft), tokenId, PRICE);
        
        vm.deal(buyer, PRICE - 1 ether);
        vm.prank(buyer);
        vm.expectRevert("Insufficient payment");
        marketplace.buyMarketItem{value: PRICE - 1 ether}(1);
    }
    
    function testCancelMarketItem() public {
        uint256 tokenId = nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
        
        vm.prank(seller);
        marketplace.createMarketItem(address(nft), tokenId, PRICE);
        
        vm.prank(seller);
        marketplace.cancelMarketItem(1);
        
        // После отмены, проверяем что лот удален (price = 0)
        (
            uint256 returnedTokenId,
            address nftContract,
            address sellerAddr,
            address owner,
            uint256 price,
            bool sold
        ) = marketplace.getMarketItem(1);
        
        assertEq(price, 0, "Price should be 0 after cancellation");
        assertEq(sold, false, "Sold should be false");
    }
    
    function testCancelMarketItemNotSeller() public {
        uint256 tokenId = nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
        
        vm.prank(seller);
        marketplace.createMarketItem(address(nft), tokenId, PRICE);
        
        vm.prank(anotherUser);
        vm.expectRevert("Not the seller");
        marketplace.cancelMarketItem(1);
    }
    
    function testCannotCancelSoldItem() public {
        uint256 tokenId = nft.mint(seller);
        
        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
        
        vm.prank(seller);
        marketplace.createMarketItem(address(nft), tokenId, PRICE);
        
        vm.deal(buyer, PRICE);
        vm.prank(buyer);
        marketplace.buyMarketItem{value: PRICE}(1);
        
        vm.prank(seller);
        vm.expectRevert("Item already sold");
        marketplace.cancelMarketItem(1);
    }
    
    function testGetActiveListings() public {
        uint256 numberOfListings = 5;
        uint256[] memory tokenIds = new uint256[](numberOfListings);
        
        for (uint i = 0; i < numberOfListings; i++) {
            // Минтим новый NFT для seller
            tokenIds[i] = nft.mint(seller);
            
            // Апрувим маркетплейс
            vm.prank(seller);
            nft.setApprovalForAll(address(marketplace), true);
            
            // Создаем лот
            vm.prank(seller);
            marketplace.createMarketItem(address(nft), tokenIds[i], PRICE);
        }
        
        NFTMarketplace.MarketItem[] memory active = marketplace.getActiveListings();
        assertEq(active.length, numberOfListings, "Should have all listings");
        
        // Проверяем, что все лоты корректны
        for (uint i = 0; i < active.length; i++) {
            assertEq(active[i].tokenId, tokenIds[i], "TokenId mismatch");
            assertEq(active[i].nftContract, address(nft), "NFT contract mismatch");
            assertEq(active[i].seller, seller, "Seller mismatch");
            assertEq(active[i].price, PRICE, "Price mismatch");
            assertFalse(active[i].sold, "Should not be sold");
        }
    }
    
    function testGetActiveListingsAfterPurchase() public {
        uint256 numberOfListings = 3;
        uint256[] memory tokenIds = new uint256[](numberOfListings);
        
        // Создаем 3 лота
        for (uint i = 0; i < numberOfListings; i++) {
            tokenIds[i] = nft.mint(seller);
            
            vm.prank(seller);
            nft.setApprovalForAll(address(marketplace), true);
            
            vm.prank(seller);
            marketplace.createMarketItem(address(nft), tokenIds[i], PRICE);
        }
        
        // Покупаем первый лот (marketItemId = 1)
        vm.deal(buyer, PRICE);
        vm.prank(buyer);
        marketplace.buyMarketItem{value: PRICE}(1);
        
        // Проверяем активные лоты (должно быть 2)
        NFTMarketplace.MarketItem[] memory active = marketplace.getActiveListings();
        assertEq(active.length, numberOfListings - 1, "Should have 2 active listings after purchase");
        
        // Проверяем, что проданный лот не в списке
        for (uint i = 0; i < active.length; i++) {
            assertTrue(active[i].tokenId != tokenIds[0], "Sold item should not be in active listings");
        }
    }
    
    function testGetMarketItemDoesNotExist() public view {
        // Проверяем, что несуществующий лот возвращает price = 0
        (
            uint256 tokenId,
            address nftContract,
            address sellerAddr,
            address owner,
            uint256 price,
            bool sold
        ) = marketplace.getMarketItem(999);
        
        assertEq(price, 0, "Price should be 0 for non-existent item");
        assertEq(sold, false, "Sold should be false");
    }
    
    function testMultipleMintsAndListings() public {
        uint256 numberOfListings = 3;
        
        for (uint i = 0; i < numberOfListings; i++) {
            uint256 tokenId = nft.mint(seller);
            
            vm.prank(seller);
            nft.setApprovalForAll(address(marketplace), true);
            
            vm.prank(seller);
            marketplace.createMarketItem(address(nft), tokenId, PRICE);
        }
        
        // Проверяем количество активных лотов
        NFTMarketplace.MarketItem[] memory active = marketplace.getActiveListings();
        assertEq(active.length, numberOfListings);
        
        // Проверяем, что все лоты имеют разные tokenId
        for (uint i = 0; i < active.length - 1; i++) {
            for (uint j = i + 1; j < active.length; j++) {
                assertTrue(active[i].tokenId != active[j].tokenId, "TokenIds should be unique");
            }
        }
    }
    
    receive() external payable {}
}