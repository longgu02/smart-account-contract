import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";

const FACTORY_NONCE = 1;
const acc = "0x2b5a3ba1818c8e93bb852ab3b399756641550ceb";
const AF_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const EP_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const PM_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const SM_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const ERC20SM_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const ECDSASM_ADDRESS = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

async function main() {
	const [signer0, sessionKey, signer2] = await ethers.getSigners();
	// CREATE: hash(deployer + nonce)
	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	const address0 = await signer0.getAddress();
	console.log(address0);
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const transaction = {
		to: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		value: ethers.parseEther("10"), // Sends 1 Ether
	};

	let initCode =
		AF_ADDRESS +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [address0, EP_ADDRESS])
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
	} else {
	}

	const { merkleTree, data } = genMerkleTree(
		ERC20SM_ADDRESS,
		await sessionKey.getAddress(),
		await calculateNativeSessionKeyData(
			await sessionKey.getAddress(),
			await signer2.getAddress(),
			ethers.parseEther("1000")
		)
	);

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
	const SessionKeyManager = await ethers.getContractFactory(
		"SessionKeyManager"
	);
	await entryPoint.depositTo(PM_ADDRESS, {
		value: ethers.parseEther("10"),
	});
	// await entryPoint.depositTo(acc, {
	// 	value: ethers.parseEther("10"),
	// });
	// await entryPoint.depositTo("0xa16E02E87b7454126E5E10d957A927A7F5B5d2be", {
	// 	value: ethers.parseEther("1000"),
	// });
	console.log({ merkle: merkleTree.getHexRoot() });
	const userOp = {
		sender, // smart account address
		nonce: await entryPoint.getNonce(sender, 0),
		initCode,
		// callData: Account.interface.encodeFunctionData("execute", [
		// 	SM_ADDRESS,
		// 	ethers.parseEther("0"),
		// 	SessionKeyManager.interface.encodeFunctionData("setMerkleRoot", [
		// 		merkleTree.getHexRoot(),
		// 	]),
		// ]),
		callData: Account.interface.encodeFunctionData("execute", [
			await signer2.getAddress(),
			ethers.parseEther("10"),
			"0x",
		]),
		callGasLimit: 900_000 * 10,
		verificationGasLimit: 900_000 * 10,
		preVerificationGas: 400_000 * 10,
		maxFeePerGas: ethers.parseUnits("1000", "gwei"),
		maxPriorityFeePerGas: ethers.parseUnits("500", "gwei"),
		paymasterAndData: PM_ADDRESS, // PM_ADDRESS
		signature: "0x",
	};

	const userOpHash = await entryPoint.getUserOpHash(userOp);
	const sessionKeySig = await sessionKey.signMessage(
		ethers.getBytes(userOpHash)
	);

	const defaultAbi = ethers.AbiCoder.defaultAbiCoder();

	const paddedSig = defaultAbi.encode(
		// validUntil, validAfter, sessionVerificationModule address, validationData, merkleProof, signature
		["uint48", "uint48", "address", "bytes", "bytes32[]", "bytes"],
		[
			0,
			0,
			ERC20SM_ADDRESS,
			await calculateNativeSessionKeyData(
				await sessionKey.getAddress(),
				await signer2.getAddress(),
				ethers.parseEther("1000")
			),
			merkleTree.getHexProof(ethers.keccak256(data)),
			sessionKeySig,
		]
	);
	// console.log({
	// 	check: merkleTree.verify(
	// 		merkleTree.getProof(data),
	// 		data,
	// 		merkleTree.getHexRoot()
	// 	),
	// });

	// const signatureWithModuleAddress = defaultAbi.encode(
	// 	["bytes", "address"],
	// 	[paddedSig, SM_ADDRESS]
	// );
	const signatureWithModuleAddress = defaultAbi.encode(
		["bytes", "address"],
		[await signer0.signMessage(ethers.getBytes(userOpHash)), ECDSASM_ADDRESS]
	);
	// console.log({
	// 	sessionKeySig,
	// 	paddedSig,
	// 	signatureWithModuleAddress,
	// 	length1: sessionKeySig.length,
	// 	length2: signatureWithModuleAddress.length,
	// });
	// userOp.signature = await signer0.signMessage(
	// 	ethers.getBytes(ethers.id("wee"))
	// );
	userOp.signature = signatureWithModuleAddress;
	// userOp.signature = await signer0.signMessage(ethers.getBytes(userOpHash));

	console.log(
		defaultAbi.decode(
			["uint48", "uint48", "address", "bytes", "bytes32[]", "bytes"],
			paddedSig
		)
	);

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
