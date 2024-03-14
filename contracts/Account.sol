// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

contract Test {
    constructor(bytes memory sig) {
        address recover = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(keccak256("wee")),
            sig
        );
        console.log(recover);
    }
}

contract Account is IAccount {
    uint public count;
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    fallback() external payable {}

    receive() external payable {}

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256
    ) external view returns (uint256 validationData) {
        address recovered = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(userOpHash),
            userOp.signature
        );
        return owner == recovered ? 0 : 1;
    }

    function sendERC20(
        address payable _to,
        address addERC20,
        uint256 _amount
    ) public {
        // Create an instance of the ERC20 token contract
        IERC20 token = IERC20(addERC20);

        // Transfer the tokens
        require(token.transfer(_to, _amount), "Transfer failed");
    }

    function sendEther(address payable _to, uint256 _amount) public {
        require(
            address(this).balance >= _amount,
            "Insufficient balance in contract"
        );
        _to.transfer(_amount);
    }

    function execute() external {
        count += 10;
    }
}

contract AccountFactory {
    function createAccount(address owner) external returns (address) {
        bytes32 salt = bytes32(uint256(uint160(owner)));
        bytes memory creationCode = type(Account).creationCode;
        bytes memory bytecode = abi.encodePacked(
            creationCode,
            abi.encode(owner)
        );

        address addr = Create2.computeAddress(salt, keccak256(bytecode));
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }

        return deploy(salt, bytecode);
    }

    function deploy(
        bytes32 salt,
        bytes memory bytecode
    ) internal returns (address addr) {
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        /// @solidity memory-safe-assembly
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }
}
