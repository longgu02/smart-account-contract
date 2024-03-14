import { ethers } from "hardhat";

const FACTORY_NONCE = 1;
const acc = "0xeC4cFde48EAdca2bC63E94BB437BbeAcE1371bF3";
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EP_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	// CREATE: hash(deployer + nonce)
	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	const address0 = await signer0.getAddress();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const transaction = {
		to: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		value: ethers.parseEther("10"), // Sends 1 Ether
	};

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
		sender = "0x" + ex.data.data.slice(-40);
		// Testnet
		// sender = "0x" + ex.data.slice(-40)
	}

	console.log({ sender });

	const code = await ethers.provider.getCode(sender);
	if (code !== "0x") {
		initCode = "0x";
	}

	// const wallet = new ethers.Wallet(
	// 	"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
	// 	provider
	// );

	// const wallet = new ethers.Wallet(
	// 	"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
	// 	provider
	// );
	// await wallet
	// 	.sendTransaction(transaction)
	// 	.then((tx) => {
	// 		console.log(tx);
	// 	})
	// 	.catch((error) => {
	// 		console.error("loi", error);
	// 	});
	// console.log(await signer0.toJSON());
	// const wallet = new ethers.Wallet(signer0.)
	// await signer0
	// 	.sendTransaction(transaction)
	// 	.then((tx) => {
	// 		console.log(tx);
	// 	})
	// 	.catch((error) => {
	// 		console.error("loi", error);
	// 	});

	const Account = await ethers.getContractFactory("Account");
	// await entryPoint.depositTo(PM_ADDRESS, {
	// 	value: ethers.parseEther("0.05"),
	// });
	// await entryPoint.depositTo("0xa16E02E87b7454126E5E10d957A927A7F5B5d2be", {
	// 	value: ethers.parseEther("1000"),
	// });

	const userOp = {
		sender, // smart account address
		nonce: await entryPoint.getNonce(sender, 0),
		initCode,
		// callData: Account.interface.encodeFunctionData("sendEther", [
		// 	"0xA10cF1b64fAFCD75ED18A905F96408f38f570fa6",
		// 	100000,
		// ]),
		callData: Account.interface.encodeFunctionData("execute"),
		callGasLimit: 700_000,
		verificationGasLimit: 700_000,
		preVerificationGas: 200_000,
		maxFeePerGas: ethers.parseUnits("10", "gwei"),
		maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
		paymasterAndData: PM_ADDRESS,
		signature: "0x",
	};

	const userOpHash = await entryPoint.getUserOpHash(userOp);
	userOp.signature = await signer0.signMessage(ethers.getBytes(userOpHash));
	// userOp.signature = await signer0.signMessage(
	// 	ethers.getBytes(ethers.id("wee"))
	// );

	const tx = await entryPoint.handleOps([userOp], address0);
	const receipt = await tx.wait();
	console.log(receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
