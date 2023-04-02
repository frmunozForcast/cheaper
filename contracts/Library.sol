// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

struct SaleObject {
    uint256 retailPrice;
    uint256 wholeSalePrice;
    uint256 wholeSaleGoal;
}

struct InterestObject {
    address user;
    uint256[] amount;
}