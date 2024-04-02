import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";

const FACTORY_NONCE = 1;
const acc = "0x21e12ec5793b7644de1eb22b246dc0e4e3b08eba";
const AF_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const SM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const ERC20SM_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const NATIVESM_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const ECDSASM_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

async function main() {
	const [signer0, signer1, signer2] = await ethers.getSigners();
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

	// const ecdsaOwnerInitData =
	// 	ECDSAValidationContract.interface.encodeFunctionData(
	// 		"initForSmartAccount",
	// 		[signer0]
	// 	);

	let initCode =
		AF_ADDRESS +
		AccountFactory.interface
			.encodeFunctionData("createAccount", [
				address0,
				ECDSASM_ADDRESS,
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

	const Account = await ethers.getContractFactory("Account");
	const SessionKeyManager = await ethers.getContractFactory(
		"SessionKeyManager"
	);
	await entryPoint.depositTo(PM_ADDRESS, {
		value: ethers.parseEther("10"),
	});

	const userOp = {
		sender, // smart account address
		nonce: await entryPoint.getNonce(sender, 0),
		initCode,
		callData: Account.interface.encodeFunctionData("executeBatch", [
			[await signer1.getAddress(), await signer1.getAddress()],
			[ethers.parseEther("4"), ethers.parseEther("3")],
			["0x", "0x"],
		]),
		callGasLimit: 900_000 * 4,
		verificationGasLimit: 900_000 * 4,
		preVerificationGas: 400_000 * 4,
		maxFeePerGas: ethers.parseUnits("100", "gwei"),
		maxPriorityFeePerGas: ethers.parseUnits("50", "gwei"),
		paymasterAndData: PM_ADDRESS, // PM_ADDRESS
		signature: "0x",
	};

	const userOpHash = await entryPoint.getUserOpHash(userOp);

	const defaultAbi = ethers.AbiCoder.defaultAbiCoder();

	// const paddedSig = defaultAbi.encode(
	// 	// validUntil, validAfter, sessionVerificationModule address, validationData, merkleProof, signature
	// 	["uint48", "uint48", "address", "bytes", "bytes32[]", "bytes"],
	// 	[
	// 		0,
	// 		0,
	// 		ERC20SM_ADDRESS,
	// 		await calculateNativeSessionKeyData(
	// 			await sessionKey.getAddress(),
	// 			await signer2.getAddress(),
	// 			ethers.parseEther("1000")
	// 		),
	// 		merkleTree.getHexProof(ethers.keccak256(data)),
	// 		sessionKeySig,
	// 	]
	// );
	const signature = await signer0.signMessage(ethers.getBytes(userOpHash));

	const signatureWithModuleAddress = defaultAbi.encode(
		["bytes", "address"],
		[signature, ECDSASM_ADDRESS]
	);

	userOp.signature = signatureWithModuleAddress;
	// userOp.signature = await signer0.signMessage(ethers.getBytes(userOpHash));
	console.log({ signature });
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
