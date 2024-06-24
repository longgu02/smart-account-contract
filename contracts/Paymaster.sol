// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";

contract Paymaster is IPaymaster {
    function validatePaymasterUserOp(
        UserOperation calldata,
        bytes32,
        uint256
    ) external pure returns (bytes memory context, uint256 validationData) {
        context = new bytes(0);
        validationData = 0;
    }

    /**
     * @dev Deposit funds for a given paymasterId to cover transaction fees.
     * @param paymasterId Identifier of the dapp receiving the deposit.
     */
    function depositFor(address paymasterId) external payable nonReentrant {
        if (paymasterId == address(0)) revert PaymasterIdCannotBeZero();
        if (msg.value == 0) revert DepositCanNotBeZero();
        paymasterIdBalances[paymasterId] =
            paymasterIdBalances[paymasterId] +
            msg.value;
        ENTRY_POINT.depositTo{value: msg.value}(address(this));
        emit GasDeposited(paymasterId, msg.value);
    }

    function withdrawTo(
        address payable withdrawAddress,
        uint256 amount
    ) public override nonReentrant {
        if (withdrawAddress == address(0)) revert CanNotWithdrawToZeroAddress();
        uint256 currentBalance = paymasterIdBalances[msg.sender];
        if (amount > currentBalance)
            revert InsufficientBalance(amount, currentBalance);
        paymasterIdBalances[msg.sender] =
            paymasterIdBalances[msg.sender] -
            amount;
        ENTRY_POINT.withdrawTo(withdrawAddress, amount);
        emit GasWithdrawn(msg.sender, withdrawAddress, amount);
    }

    /**
     * post-operation handler.
     * Must verify sender is the entryPoint
     * @param mode enum with the following options:
     *      opSucceeded - user operation succeeded.
     *      opReverted  - user op reverted. still has to pay for gas.
     *      postOpReverted - user op succeeded, but caused postOp (in mode=opSucceeded) to revert.
     *                       Now this is the 2nd call, after user's op was deliberately reverted.
     * @param context - the context value returned by validatePaymasterUserOp
     * @param actualGasCost - actual gas used so far (without this postOp call).
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external {}
}
