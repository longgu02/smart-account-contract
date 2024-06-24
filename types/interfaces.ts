import { ethers } from "hardhat";

interface UserOp {
	sender?: string; // smart account address
	nonce: string;
	initCode: string;
	callData: string;
	callGasLimit?: Number;
	verificationGasLimit?: Number;
	preVerificationGas?: Number;
	maxFeePerGas?: string;
	maxPriorityFeePerGas?: string;
	paymasterAndData: string;
	signature: string;
}

interface PoolInfo {
	token0: string;
	token1: string;
	fee: number;
	tickSpacing: number;
	sqrtPriceX96: BigInt;
	liquidity: BigInt;
	tick: number;
}
