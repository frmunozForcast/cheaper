// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

abstract contract CheaperStorage {
    mapping(bytes32 => string) private stringStorage;
    mapping(bytes32 => bytes) private bytesStorage;
    mapping(bytes32 => uint256) private uintStorage;
    mapping(bytes32 => int256) private intStorage;
    mapping(bytes32 => address) private addressStorage;
    mapping(bytes32 => bool) private booleanStorage;
    mapping(bytes32 => bytes32) private bytes32Storage;

    function _authorize() internal virtual;

    function _encode(string memory _key) private pure returns(bytes32) {
        return keccak256(abi.encodePacked(_key));
    }

    function getAddress(string memory _key) external view returns (address) {
        return addressStorage[_encode(_key)];
    }

    function getUint256(string memory _key) external view returns (uint256) {
        return uintStorage[_encode(_key)];
    }

    function getString(string memory _key) external view returns (string memory) {
        return stringStorage[_encode(_key)];
    }

    function getBytes(string memory _key) external view returns (bytes memory) {
        return bytesStorage[_encode(_key)];
    }

    function getBool(string memory _key) external view returns (bool) {
        return booleanStorage[_encode(_key)];
    }

    function getInt(string memory _key) external view returns (int) {
        return intStorage[_encode(_key)];
    }

    function getBytes32(string memory _key) external view returns (bytes32) {
        return bytes32Storage[_encode(_key)];
    }

    /** SET FUNCTIONS */
    function setAddress(string memory _key, address _value) external {
        _authorize();
        addressStorage[_encode(_key)] = _value;
    }

    function setUint256(string memory _key, uint256 _value) external {
        _authorize();
        uintStorage[_encode(_key)] = _value;
    }

    function setString(string memory _key, string calldata _value) external {
        _authorize();
        stringStorage[_encode(_key)] = _value;
    }

    function setBytes(string memory _key, bytes calldata _value) external {
        _authorize();
        bytesStorage[_encode(_key)] = _value;
    }

    function setBool(string memory _key, bool _value) external {
        _authorize();
        booleanStorage[_encode(_key)] = _value;
    }

    function setInt(string memory _key, int _value) external {
        _authorize();
        intStorage[_encode(_key)] = _value;
    }

    function setBytes32(string memory _key, bytes32 _value) external {
        _authorize();
        bytes32Storage[_encode(_key)] = _value;
    }

    /** DELETE FUNCTIONS  */
    function deleteAddress(string memory _key) external {
        _authorize();
        delete addressStorage[_encode(_key)];
    }

    function deleteUint256(string memory _key) external {
        _authorize();
        delete uintStorage[_encode(_key)];
    }

    function deleteString(string memory _key) external {
        _authorize();
        delete stringStorage[_encode(_key)];
    }

    function deleteBytes(string memory _key) external {
        _authorize();
        delete bytesStorage[_encode(_key)];
    }

    function deleteBool(string memory _key) external {
        _authorize();
        delete booleanStorage[_encode(_key)];
    }

    function deleteInt(string memory _key) external {
        _authorize();
        delete intStorage[_encode(_key)];
    }

    function deleteBytes32(string memory _key) external {
        _authorize();
        delete bytes32Storage[_encode(_key)];
    }
    
}