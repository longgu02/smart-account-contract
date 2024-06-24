import { ethers } from "hardhat";

export const getEntryPoint = async () => {
	const entryPoint = await ethers.getContractAt(
		"EntryPoint",
		"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
	);
	return entryPoint;
};

export const getModuleAddress = () => {};

export function pack(addr: string, functionId: number): Buffer {
	// Remove the '0x' prefix from the address and pad it to 40 characters
	const addrPadded = addr.replace(/^0x/, "").padStart(40, "0");

	// Convert the address and functionId to Buffers
	const addrBuf = Buffer.from(addrPadded, "hex");
	const functionIdBuf = Buffer.from(
		functionId.toString(16).padStart(2, "0"),
		"hex"
	);

	// Combine the address and functionId Buffers
	const combined = Buffer.concat([addrBuf, functionIdBuf]);

	return combined;
}

import { Token, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v3-sdk";

const MAX_DECIMALS = 4;

export function fromReadableAmount(amount: number, decimals: number): BigInt {
	return ethers.parseUnits(amount.toString(), decimals);
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
	return ethers.formatUnits(rawAmount, decimals).slice(0, MAX_DECIMALS);
}

export function displayTrade(trade: Trade<Token, Token, TradeType>): string {
	return `${trade.inputAmount.toExact()} ${
		trade.inputAmount.currency.symbol
	} for ${trade.outputAmount.toExact()} ${trade.outputAmount.currency.symbol}`;
}

// function sendTransactionViaWallet(
//   transaction: ethers.providers.TransactionRequest
// ): Promise<TransactionState> {
//   if (transaction.value) {
//     transaction.value = BigNumber.from(transaction.value)
//   }
//   const txRes = await wallet.sendTransaction(transaction)

//   let receipt = null
//   const provider = getProvider()
//   if (!provider) {
//     return TransactionState.Failed
//   }

//   while (receipt === null) {
//     try {
//       receipt = await provider.getTransactionReceipt(txRes.hash)

//       if (receipt === null) {
//         continue
//       }
//     } catch (e) {
//       console.log(`Receipt error:`, e)
//       break
//     }
//   }

//   // Transaction was successful if status === 1
//   if (receipt) {
//     return TransactionState.Sent
//   } else {
//     return TransactionState.Failed
//   }
// }

export const getPoolImmutables = async (poolContract) => {
	const [token0, token1, fee] = await Promise.all([
		poolContract.token0(),
		poolContract.token1(),
		poolContract.fee(),
	]);

	const immutables = {
		token0: token0,
		token1: token1,
		fee: fee,
	};
	return immutables;
};

export const getPoolState = async (poolContract) => {
	const slot = poolContract.slot0();

	const state = {
		sqrtPriceX96: slot[0],
	};

	return state;
};
