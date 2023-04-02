// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    address private owner;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _owner
    ) ERC20(name, symbol) {
        // the initialSupply is given in Eth units, and the token will
        // always use 18 decimales (a.k.a 1 ether) to match with eth formats
        _mint(_owner, initialSupply * 10**18);
        owner = _owner;
    }

    function isOwner(address user) public view returns(bool){
        return user == owner;
    }
}