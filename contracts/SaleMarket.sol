// contract to handle the manage of wholeSale goals
//
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

// import from local contracts
import { SaleObject,  InterestObject} from "./Library.sol";

// Importing OpenZeppelin's SafeMath Implementation
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ERC20Token} from "./ERC20Token.sol";

contract SaleMarket {
    using SafeMath for uint256;

    address[] private interestAddresses;
    mapping(address => uint256) interestList;
    

    uint256 private currentTotal;
    address payable private owner;
    ERC20Token private token;
    SaleObject private saleConfig;
    uint256 private commissionFee;
    address payable commissionAddress;
    bool private lockSale;

    event WithdrawWholeSaleDeposit(
        address buyer, uint256 amount, uint256 wholeSaleAmount, uint256 date
    );
    event ExecuteWholeSale(
        uint256 amountSale, uint256 commissioncharge, uint256 price, uint256 date
    );
    event BuyWholeSale(
        address buyer, uint256 amount, uint256 wholeSaleAmount, uint256 date
    );

    event ExecutedBuyWholeSale(
        address seller, address buyer, uint256 amount,
         uint256 price, uint256 tokens, uint256 date
    );

    event BuyRetail(
        address seller, address buyer, uint256 amount, 
        uint256 commissioncharge, uint256 price, uint256 tokens, uint256 date
    );

    modifier isOwner() {
        require(msg.sender == owner,"Not pool owner" );
        _;
    }

    modifier hasDeposited() {
        require(_addressExists(msg.sender), "need to deposit an amount first");
        _;
    }

    modifier isUnlock() {
        require(!lockSale, "sale is locked by owner");
        _;
    }

    constructor (
        address _tokenAddress,
        address _owner,
        SaleObject memory _saleConfig,
        uint256 _commissionFee,
        address _commissionAddress
    ) {
        owner = payable(_owner);
        token = ERC20Token(_tokenAddress);
        saleConfig = _saleConfig;
        commissionFee = _commissionFee;
        commissionAddress = payable(_commissionAddress);
        lockSale = false;
        currentTotal = 0;
    }

    function _addressExists(address user) internal view returns(bool){
        for (uint i = 0; i < interestAddresses.length; i++){
            if (interestAddresses[i] == user){
                return true;
            }
        }
        return false;
    }

    function _balanceValidation(
        uint256 nTokenToBuy, address seller
    ) internal view returns (bool) {
        //hay q chequear el allowance approved
        return token.balanceOf(seller) >= nTokenToBuy;
    }    
    
    function _allowanceValidation(
        uint256 nTokenToBuy, address seller
    ) internal view returns (bool) {
        //hay q chequear el allowance approved
        return token.allowance(seller, address(this)) >= nTokenToBuy;
    }

    function _transferTokens(address buyer, uint256 nTokensToBuy) internal 
        returns(bool){
        // check user has the requested balance
        require(_balanceValidation(nTokensToBuy, owner),
                "token amount not available");
        // check user has autorized the requested value
        require(_allowanceValidation(nTokensToBuy, owner),
                "token allowance not available");
        return token.transferFrom(owner, buyer, nTokensToBuy);
    }

    function _ethTransferTo(address _to, uint256 amount) internal{
        uint256 amountToSend = amount;
        require(amountToSend > 0, "Insuffiecient balance");
        amount = 0;
        bool success = payable(_to).send(amountToSend);
        require(success, "Failed to send ether");
    }

    function getDetails() external view returns(
        uint256 retailPrice,
        uint256 wholeSalePrice,
        uint256 wholeSaleGoalAmount,
        uint256 totalDepositAmount,
        uint256 totalInterestedAccounts,
        uint256 totalTokensAvailable,
        bool lockStatus,
        address ownerAddress,
        address tokenAddress
    ){
        retailPrice = saleConfig.retailPrice;
        wholeSalePrice = saleConfig.wholeSalePrice;
        wholeSaleGoalAmount = saleConfig.wholeSaleGoal;
        totalDepositAmount = currentTotal;
        totalInterestedAccounts = interestAddresses.length;
        uint256 res = currentTotal % saleConfig.wholeSalePrice;
        uint256 _partial = currentTotal.sub(res);
        _partial = _partial.div(saleConfig.wholeSalePrice);
        totalTokensAvailable = token.balanceOf(owner).sub(_partial);
        lockStatus = lockSale;
        ownerAddress = owner;
        tokenAddress = tokenAddress;
    }

    function withdraw(uint256 amount) external payable hasDeposited {
        // withdraw given amount
        require(
            amount <= interestList[msg.sender], 
            "trying to withdraw more than total amount deposited");
        _ethTransferTo(msg.sender, amount);
        interestList[msg.sender].sub(amount);
        currentTotal.sub(amount);
        emit WithdrawWholeSaleDeposit(
            msg.sender, amount, currentTotal, block.timestamp
        );
    }

    function buyWholeSale() public payable isUnlock{
        // deposit amount for a future whole sale at lower price
        currentTotal = currentTotal.add(msg.value);
        if (!_addressExists(msg.sender)){
            interestAddresses.push(msg.sender);
            interestList[msg.sender] = interestList[msg.sender].add(msg.value);
        }
        else {
            interestList[msg.sender] = interestList[msg.sender] = msg.value;
        }
        emit BuyWholeSale(
            msg.sender, msg.value, currentTotal, block.timestamp
        );
    }

    function buyRetail() external payable returns(uint256){
        // directly buy tokens at retail price
        // in this case, it is required to match exactly the total amount
        // of tokens to buy
        require(msg.value % saleConfig.retailPrice == 0,
                "given funds will result in fractional token!");
        uint256 nTokensToBuy = msg.value.div(saleConfig.retailPrice);
        bool success = _transferTokens(msg.sender, nTokensToBuy);
        require(success, "failed to transfer tokens!");

        uint256 charge = commissionFee.mul(msg.value).div(100);
        uint256 amountToSeller = msg.value.sub(charge);
        _ethTransferTo(owner, amountToSeller);
        _ethTransferTo(commissionAddress, charge);

        if(token.balanceOf(owner) < saleConfig.wholeSaleGoal){
            lockSale = true;
        }

        emit BuyRetail(
            owner, msg.sender, msg.value, charge, saleConfig.retailPrice, nTokensToBuy, block.timestamp
        );
        return nTokensToBuy;
    }

    function getDepositAmount() external view hasDeposited returns(uint256){
        return interestList[msg.sender];
    }

    function executeWholeSale() external payable isOwner {
        // check that goal is met
        require (saleConfig.wholeSaleGoal <= currentTotal, "goal for wholeSale not net");
        // execute the wholeSale with the special prices
        lockSale = true;
        uint256 res;
        uint256 actualTotal;
        bool success;
        uint256 totalSale = 0;
        // transfer tokens to each interested address
        for (uint i = 0; i < interestAddresses.length; i++){
            res = interestList[interestAddresses[i]] % saleConfig.wholeSalePrice;
            actualTotal = interestList[interestAddresses[i]].sub(res);
            if (actualTotal > 0){
                interestList[interestAddresses[i]] = 
                interestList[interestAddresses[i]].sub(actualTotal);
                currentTotal = currentTotal.sub(actualTotal);
                totalSale = totalSale.add(actualTotal);
                success = _transferTokens(
                    interestAddresses[i], 
                    actualTotal.div(saleConfig.wholeSalePrice));
                if (!success){
                    // abort transaction
                    interestList[interestAddresses[i]] = 
                    interestList[interestAddresses[i]].add(actualTotal);
                    currentTotal = currentTotal.add(actualTotal);
                    totalSale = totalSale.sub(actualTotal);
                } else {
                    emit ExecutedBuyWholeSale(
                        owner, interestAddresses[i], actualTotal, saleConfig.wholeSalePrice, 
                        actualTotal.div(saleConfig.wholeSalePrice), block.timestamp
                    );
                }
            }
        }
        // transfer eth
        uint256 charge = commissionFee.mul(totalSale).div(100);
        uint256 amountToSeller = totalSale.sub(charge);
        _ethTransferTo(owner, amountToSeller);
        _ethTransferTo(commissionAddress, charge);

        emit ExecuteWholeSale(
            totalSale, charge, saleConfig.wholeSalePrice, block.timestamp
        );
    }

    function unlockSale() external isOwner {
        lockSale = false;
    }

    function setSaleconfig(
        uint256 retailPrice, 
        uint256 wholeSaleGoal
    ) external isOwner {
        saleConfig.retailPrice = retailPrice;
        saleConfig.wholeSaleGoal = wholeSaleGoal;
        // by desing cannot udate whole sale prioce
        // saleConfig.wholeSalePrice = wholeSalePrice;
    }
}