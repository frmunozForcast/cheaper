
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

// import from local contracts
import { SaleObject } from "./Library.sol";

// Importing OpenZeppelin's SafeMath Implementation
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MarketCheaper {
    using SafeMath for uint256;

    address private comissionOwner;
    uint256 private comissionFee;

    mapping(address => mapping(address => SaleObject)) usersTokenSales;
    
    event saleProperty(
        address seller, address token, uint256 price, uint256 unit, 
        uint256 date);
    event buyRecord(
        address seller, address buyer, address token, uint256 amount, 
        uint256 price, uint256 spent, uint256 commission, uint256 date);

    constructor (
        address _comission_owner, 
        uint256 _comission_fee
    ) {
        comissionOwner = _comission_owner;
        // commission fee is specified in integer percentage [0, 100]
        comissionFee =  _comission_fee;
    }

    function _balanceValidation(
        uint256 nTokenToBuy, address seller, 
        address tokenAddress
    ) internal view returns (bool) {

        IERC20 token = IERC20(tokenAddress);
        //hay q chequear el allowance approved
        return token.balanceOf(seller) >= nTokenToBuy;
    }    
    
    function _allowanceValidation(
        uint256 nTokenToBuy, address seller, 
        address tokenAddress
    ) internal view returns (bool) {
        IERC20 token = IERC20(tokenAddress);
        //hay q chequear el allowance approved
        return token.allowance(seller, address(this)) >= nTokenToBuy;
    }

    function _transferTo(address _to, uint256 _amount) 
        internal returns (bool success) {
        success = payable(_to).send(_amount);
    }

    function setSaleProperties(
        address tokenAddress, 
        uint256 newPrice,
        uint256 newMinDivision
    ) external {
        usersTokenSales[msg.sender][tokenAddress].token_price = newPrice;
        usersTokenSales[msg.sender][tokenAddress].min_unit = newMinDivision;
        emit saleProperty(
            msg.sender, tokenAddress, newPrice, newMinDivision, 
            block.timestamp);
    }

    function getSaleProperties(
        address tokenAddress, 
        address seller
    ) external view returns(
        uint256 price,
        uint256 minUnit
    ){
        // additional getter to the event emits
        price = usersTokenSales[seller][tokenAddress].token_price;
        minUnit = usersTokenSales[seller][tokenAddress].min_unit;
    }

    function buyToken( 
        uint256 nTokenToBuy, 
        address seller, address tokenAddress
    ) payable external {
        // check nTokenToBuy multipl of minUnit
        require(nTokenToBuy % usersTokenSales[seller][tokenAddress].min_unit == 0,
                "nTokenToBuy is not divisible by the minimum division part");
        // check eth amount match total price to pay
        require( msg.value >= usersTokenSales[seller][tokenAddress].token_price.mul(nTokenToBuy), 
                "ether paid less than expected amount");
        // check user has the requested balance
        require(_balanceValidation(nTokenToBuy, seller, tokenAddress),
                "token amount not available");
        // check user has autorized the requested value
        require(_allowanceValidation(nTokenToBuy, seller, tokenAddress),
                "token allowance not available");
        
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(seller, msg.sender, nTokenToBuy);

        uint256 charge = comissionFee.mul(msg.value).div(100);
        uint256 amountToSeller = msg.value.sub(charge);

        _transferTo(seller, amountToSeller);
        //Se cobra comision
        _transferTo(comissionOwner, charge);
        emit buyRecord(
            seller, msg.sender, tokenAddress, nTokenToBuy, 
            usersTokenSales[seller][tokenAddress].token_price, msg.value, 
            charge, block.timestamp);
    }
}