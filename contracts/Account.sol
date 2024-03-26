// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import {IAuthorizationModule} from "./interfaces/IAuthorizationModule.sol";
import {ModuleManager} from "./base/ModuleManager.sol";
import {SmartAccountErrors} from "./common/Errors.sol";

// import {SmartAccount} from "./SmartAccount.sol";

contract Test {
    constructor(bytes memory sig) {
        address recover = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(keccak256("wee")),
            sig
        );
        console.log(recover);
    }
}

contract Account is IAccount, ModuleManager, SmartAccountErrors {
    uint public count;
    address public owner;
    mapping(address => bool) public signable;

    IEntryPoint private immutable ENTRY_POINT;
    address private immutable SELF;

    constructor(address _owner, address _entryPointAddress) {
        owner = _owner;
        ENTRY_POINT = IEntryPoint(_entryPointAddress);
        SELF = address(this);
    }

    fallback() external payable {}

    receive() external payable {}

    /**
     * @dev Adds a module to the allowlist.
     * @notice This can only be done via a userOp or a selfcall.
     * @notice Enables the module `module` for the wallet.
     * @param module Module to be allow-listed.
     */
    function enableModule(address module) external virtual override {
        // _requireFromEntryPointOrSelf();
        _enableModule(module);
    }

    /**
     * @dev Setups module for this Smart Account and enables it.
     * @notice This can only be done via userOp or a selfcall.
     * @notice Enables the module `module` for the wallet.
     */
    function setupAndEnableModule(
        address setupContract,
        bytes memory setupData
    ) external virtual override returns (address) {
        // _requireFromEntryPointOrSelf();
        return _setupAndEnableModule(setupContract, setupData);
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256
    ) external returns (uint256 validationData) {
        // if (msg.sender != address(entryPoint()))
        //     revert CallerIsNotAnEntryPoint(msg.sender);
        if (userOp.signature.length < 200) {
            address recovered = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(userOpHash),
                userOp.signature
            );
            return owner == recovered ? 0 : 1;
        }

        (, address validationModule) = abi.decode(
            userOp.signature,
            (bytes, address)
        );
        console.log(validationModule);
        // if (address(_modules[validationModule]) != address(0)) {
        validationData = IAuthorizationModule(validationModule).validateUserOp(
            userOp,
            userOpHash
        );
        // } else {
        // revert WrongValidationModule(validationModule);
        // return 1;
        // }

        // // Check nonce requirement if any
        // _payPrefund(missingAccountFunds);
    }

    // function addSigner(address signer) external {
    //     require(msg.sender == owner, "Forbidden: Caller must be an owner");
    //     signable[signer] = true;
    // }

    // function sendERC20(
    //     address payable _to,
    //     address addERC20,
    //     uint256 _amount
    // ) public {
    //     // Create an instance of the ERC20 token contract
    //     IERC20 token = IERC20(addERC20);

    //     // Transfer the tokens
    //     require(token.transfer(_to, _amount), "Transfer failed");
    // }

    // function sendEther(address payable _to, uint256 _amount) public {
    //     require(
    //         address(this).balance >= _amount,
    //         "Insufficient balance in contract"
    //     );
    //     _to.transfer(_amount);
    // }

    // function execute() external {
    //     count += 10;
    // }

    function _call(address target, uint256 value, bytes memory data) internal {
        assembly {
            let success := call(
                gas(),
                target,
                value,
                add(data, 0x20),
                mload(data),
                0,
                0
            )
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, returndatasize())
            if iszero(success) {
                revert(ptr, returndatasize())
            }
        }
    }

    function execute_ncC(
        address dest,
        uint256 value,
        bytes calldata func
    ) public {
        // _requireFromEntryPoint();
        _call(dest, value, func);
    }

    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        execute_ncC(dest, value, func);
    }

    //     function _requireFromEntryPoint() internal view {
    //     if (msg.sender != address(entryPoint()))
    //         revert CallerIsNotEntryPoint(msg.sender);
    // }
}

contract AccountFactory {
    function createAccount(
        address owner,
        address entryPoint
    ) external returns (address) {
        bytes32 salt = bytes32(uint256(uint160(owner)));
        bytes memory creationCode = type(Account).creationCode;
        bytes memory bytecode = abi.encodePacked(
            creationCode,
            abi.encode(owner),
            abi.encode(entryPoint)
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
