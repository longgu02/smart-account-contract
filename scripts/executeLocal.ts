import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";

const FACTORY_NONCE = 1;
const acc = "0xe382aa915e047268e66b6c7b0f0ca0a77b4df6fd";
export const SP_ADDRESS = "0x11c68f4FB6ef20cf27425B3271b58340673DB104";
export const AF_ADDRESS = "0x43eFEc97A672cfCe9C91f08871C8D685D559D35c";
export const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
export const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
export const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
export const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
export const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
export const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
export const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

async function main() {
	const [signer0, sessionKey, signer2] = await ethers.getSigners();
	// CREATE: hash(deployer + nonce)
	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	const ECDSAValidationContract = await ethers.getContractAt(
		"EcdsaOwnershipRegistryModule",
		ECDSASM_ADDRESS
	);
	const address0 = await signer0.getAddress();
	console.log(address0);
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const transaction = {
		to: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		value: ethers.parseEther("10"), // Sends 1 Ether
	};

	const ecdsaOwnerInitData =
		ECDSAValidationContract.interface.encodeFunctionData(
			"initForSmartAccount",
			[signer0]
		);

	let initCode =
		AF_ADDRESS +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [
				address0,
				ECDSASM_ADDRESS,
				ecdsaOwnerInitData,
				EP_ADDRESS,
			])
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
