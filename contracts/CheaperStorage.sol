// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

abstract contract CheaperStorage {
    mapping(bytes32 => string) private stringStorage;

    function _authorize() internal virtual;

    function _encode(string memory _key) private pure returns(bytes32) {
        return keccak256(abi.encodePacked(_key));
    }

    function getString(string memory _key) external view returns (string memory) {
        return stringStorage[_encode(_key)];
    }

    /** SET FUNCTIONS */
    function setString(string memory _key, string calldata _value) external {
        _authorize();
        stringStorage[_encode(_key)] = _value;
    }

    /** DELETE FUNCTIONS  */
    function deleteString(string memory _key) external {
        _authorize();
        delete stringStorage[_encode(_key)];
    }
    
}