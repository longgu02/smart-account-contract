import { Network } from "hardhat/types";
import { ADDRESSES } from "./addresses";
import { ethers } from "hardhat";

export const fillUserOp = async (
	sender: string,
	initCode: string,
	network: Network,
	callData: {
		receiver: string;
		amount: BigInt;
		data: string;
	}
) => {
	// Get addresses
	const epAddress: string = ADDRESSES[network]["EP_ADDRESS"];
	const pmAddress: string = ADDRESSES[network]["PM_ADDRESS"];
	// Contract
	const entryPoint = await ethers.getContractAt("EntryPoint", epAddress);
	const Account = await ethers.getContractFactory("Account");
	// Fill user operation
	const userOp: UserOp = {
		sender, // smart account address
		nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
		initCode,
		callData: Account.interface.encodeFunctionData("execute", [
			callData.receiver,
			callData.amount,
			callData.data,
		]),
		// callData: Account.interface.encodeFunctionData("sendEther", [
		// 	"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43",
		// 	ethers.parseEther("0.002"),
		// ]),
		paymasterAndData: pmAddress,
		signature:
			"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
	};

	const { preVerificationGas, verificationGasLimit, callGasLimit } =
		await ethers.provider.send("eth_estimateUserOperationGas", [
			userOp,
			epAddress,
		]);

	userOp.preVerificationGas = preVerificationGas;
	userOp.verificationGasLimit = verificationGasLimit;
	userOp.callGasLimit = callGasLimit;

	const { maxFeePerGas } = await ethers.provider.getFeeData();
	userOp.maxFeePerGas = "0x" + maxFeePerGas?.toString(16);

	const maxPriorityFeePerGas = await ethers.provider.send(
		"rundler_maxPriorityFeePerGas"
	);
	userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

	return { userOp: userOp, userOpHash: await entryPoint.getUserOpHash(userOp) };
};
