
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyNft is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Yjs Master", "YJS") Ownable(msg.sender) {}

    function mintNft(address recipient, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        // Увеличиваем счетчик
        uint256 newItemId = _nextTokenId++;
        
        // Минтим токен
        _mint(recipient, newItemId);
        
        // Устанавливаем URI с метаданными
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
    
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}