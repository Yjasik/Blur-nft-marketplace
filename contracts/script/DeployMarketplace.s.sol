// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/NFTMarketplace.sol";

contract DeployMarketplace is Script {
    function run() external {
        // Получаем приватный ключ из переменной окружения
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Деплой контракта
        NFTMarketplace marketplace = new NFTMarketplace();
        
        console.log("NFTMarketplace deployed to:", address(marketplace));
        
        vm.stopBroadcast();
    }
}
