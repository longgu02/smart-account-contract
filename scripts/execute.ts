import { ethers } from "hardhat";

const FACTORY_NONCE = 1;
const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xeC4cFde48EAdca2bC63E94BB437BbeAcE1371bF3";
const FACTORY_ADDRESS = "0x0b3b4d0F8348A65D5Ba0bc365f640B8Ff9baf31F";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xD0ea240F7e207c4A9866952ce3bAE9E35Df01e2b";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	// CREATE: hash(deployer + nonce)
	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	const address0 = await signer0.getAddress();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const transaction = {
		to: acc,
		value: ethers.parseEther("10"), // Sends 1 Ether
	};
	// only first time
	let initCode =
		FACTORY_ADDRESS +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [address0])
			.slice(2);

	let sender: any;

	try {
		await entryPoint.getSenderAddress(initCode);
	} catch (ex: any) {
		// Local
		// sender = "0x" + ex.data.data.slice(-40);
		// Testnet
		sender = "0x" + ex.data.slice(-40);
	}

	console.log({ sender });

	const code = await ethers.provider.getCode(sender);
	if (code !== "0x") {
		initCode = "0x";
	}

	// const initCode = "0x";
	const Account = await ethers.getContractFactory("Account");

	// const erc20: Contract = new ethers.Contract(erc20TokenAddress, ERC20_ABI, provider)

	const userOp: UserOp = {
		sender, // smart account address
		nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
		initCode,
		// callData: Account.interface.encodeFunctionData("execute"),
		callData: Account.interface.encodeFunctionData("sendEther", [
			"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43",
			ethers.parseEther("0.002"),
		]),
		paymasterAndData: PM_ADDRESS,
		signature:
			"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
	};

	const { preVerificationGas, verificationGasLimit, callGasLimit } =
		await ethers.provider.send("eth_estimateUserOperationGas", [
			userOp,
			EP_ADDRESS,
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

	const userOpHash = await entryPoint.getUserOpHash(userOp);
	userOp.signature = await signer0.signMessage(ethers.getBytes(userOpHash));

	const opHash = await ethers.provider.send("eth_sendUserOperation", [
		userOp,
		EP_ADDRESS,
	]);

	// const receipt = await ethers.provider.waitForTransaction(opHash);
	// console.log("Transaction has been mined");
	// console.log(receipt);

	let transactionHash;
	while (!transactionHash || transactionHash == null) {
		await ethers.provider
			.send("eth_getUserOperationByHash", [opHash])
			.then((res) => {
				if (res != null) {
					transactionHash = res.transactionHash;
				}
				// console.log(res);
			});
	}
	console.log(transactionHash);

	// setTimeout(async () => {
	// 	const { transactionHash } = await ethers.provider.send(
	// 		"eth_getUserOperationByHash",
	// 		[opHash]
	// 	);

	// 	console.log(transactionHash);
	// }, 50000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
