// code inspired in
// https://github.com/samc621/TokenFactory/blob/master/contracts/Factory.sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

import "./ERC20Token.sol";
import {SaleMarket} from "./SaleMarket.sol";
import { SaleObject} from "./Library.sol";
contract Factory {

    uint256 private commissionFee;
    address private commissionAddress;


    event ERC20TokenCreated(
        address tokenAddress, string name, string symbol, address owner, uint256 date);
    event TokenForSale(
        address tokenAddress, address owner, address saleMarketAddress, uint256 wholeSalePrice, 
        uint256 retailPrice, uint256 wholeSaleGoal, uint256 date);

    constructor (address _commissionAddress){
        commissionFee = 3;
        commissionAddress = _commissionAddress;
    }
    function deployNewERC20Token(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply
    ) public returns (address) {
        ERC20Token t = new ERC20Token(
            name,
            symbol,
            initialSupply,
            msg.sender
        );
        emit ERC20TokenCreated(address(t), name, symbol, msg.sender, block.timestamp);

        return address(t);
    }

    function putTokenForSale(
        address tokenAddress, 
        uint256 wholeSaleGoal,
        uint256 wholeSalePrice,
        uint256 retailPrice
    ) public returns(address){
        ERC20Token token = ERC20Token(tokenAddress);
        require(token.isOwner(msg.sender), "is not the owner of the token");
        SaleObject memory saleConfig;
        saleConfig.retailPrice = retailPrice;
        saleConfig.wholeSaleGoal = wholeSaleGoal;
        saleConfig.wholeSalePrice = wholeSalePrice;

        SaleMarket sm = new SaleMarket(
            tokenAddress, msg.sender, saleConfig, commissionFee, commissionAddress
        );

        emit TokenForSale(
            tokenAddress, msg.sender, address(sm), wholeSalePrice, retailPrice, wholeSaleGoal, block.timestamp
        );

        return address(sm);
    }
}