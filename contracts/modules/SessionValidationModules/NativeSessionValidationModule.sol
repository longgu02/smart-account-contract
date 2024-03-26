// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./ISessionValidationModule.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ERC20 Session Validation Module for Biconomy Smart Accounts.
 * @dev Validates userOps for ERC20 transfers and approvals using a session key signature.
 *         - Recommended to use with standard ERC20 tokens only
 *         - Can be used with any method of any contract which implement
 *           method(address, uint256) interface
 *
 * @author Fil Makarov - <filipp.makarov@biconomy.io>
 */

contract NativeSessionValidationModule is ISessionValidationModule {
    /**
     * @dev validates that the call (destinationContract, callValue, funcCallData)
     * complies with the Session Key permissions represented by sessionKeyData
     * @param destination address of the contract to be called
     * @param callValue value to be sent with the call
     * param _funcCallData the data for the call. is parsed inside the SVM
     * @param _sessionKeyData SessionKey data, that describes sessionKey permissions
     * param _callSpecificData additional data, for example some proofs if the SVM utilizes merkle trees itself
     * for example to store a list of allowed tokens or receivers
     */
    function validateSessionParams(
        address destination,
        uint256 callValue,
        bytes calldata /*_funcCallData*/,
        bytes calldata _sessionKeyData,
        bytes calldata /*_callSpecificData*/
    ) external virtual override returns (address) {
        (address sessionKey, address recipient, uint256 maxAmount) = abi.decode(
            _sessionKeyData,
            (address, address, uint256)
        );

        require(callValue > 0, "NativeSV Zero Value");

        require(recipient == destination, "NativeSV Wrong Recipient");
        require(callValue <= maxAmount, "NativeSV Max Amount Exceeded");
        return sessionKey;
    }

    /**
     * @dev validates if the _op (UserOperation) matches the SessionKey permissions
     * and that _op has been signed by this SessionKey
     * Please mind the decimals of your exact token when setting maxAmount
     * @param _op User Operation to be validated.
     * @param _userOpHash Hash of the User Operation to be validated.
     * @param _sessionKeyData SessionKey data, that describes sessionKey permissions
     * @param _sessionKeySignature Signature over the the _userOpHash.
     * @return true if the _op is valid, false otherwise.
     */
    function validateSessionUserOp(
        UserOperation calldata _op,
        bytes32 _userOpHash,
        bytes calldata _sessionKeyData,
        bytes calldata _sessionKeySignature
    ) external pure override returns (bool) {
        require(
            bytes4(_op.callData[0:4]) == EXECUTE_OPTIMIZED_SELECTOR ||
                bytes4(_op.callData[0:4]) == EXECUTE_SELECTOR,
            "ERC20SV Invalid Selector"
        );
        (address sessionKey, address recipient, uint256 maxAmount) = abi.decode(
            _sessionKeyData,
            (address, address, uint256)
        );

        {
            // we expect _op.callData to be `SmartAccount.execute(to, value, calldata)` calldata
            (address recipientCalled, uint256 callValue, ) = abi.decode(
                _op.callData[4:], // skip selector
                (address, uint256, bytes)
            );
            if (recipient != recipientCalled) {
                revert("NativeSV Wrong Recipient");
            }
            if (callValue == 0) {
                revert("NativeSV Zero Value");
            }

            if (callValue > maxAmount) {
                revert("NativeSV Max Amount Exceeded");
            }
        }

        return
            ECDSA.recover(
                ECDSA.toEthSignedMessageHash(_userOpHash),
                _sessionKeySignature
            ) == sessionKey;
    }
}
