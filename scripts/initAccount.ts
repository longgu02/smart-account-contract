import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";

const FACTORY_NONCE = 1;
const acc = "0x21e12ec5793b7644de1eb22b246dc0e4e3b08eba";
export const AF_ADDRESS = "0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5";
export const SP_ADDRESS = "0x7bc06c482DEAd17c0e297aFbC32f6e63d3846650";
export const EP_ADDRESS = "0xFD471836031dc5108809D173A067e8486B9047A3";
export const PM_ADDRESS = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
export const SM_ADDRESS = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";
export const ERC20SM_ADDRESS = "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07";
export const NATIVESM_ADDRESS = "0x162A433068F51e18b7d13932F27e66a3f99E6890";
export const ECDSASM_ADDRESS = "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe";
export const CTPLUGIN_ADDRESS = "0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f";
export const SUBPLUGIN_ADDRESS = "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d";

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
	// const accountFactory = await ethers.getContractAt(
	// 	"AccountFactory",
	// 	AF_ADDRESS
	// );
	// const teich = await accountFactory.createAccount(
	// 	address0,
	// 	ECDSASM_ADDRESS,
	// 	EP_ADDRESS,
	// 	SP_ADDRESS
	// );
	// const re = await teich.wait();

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
		// callData: Account.interface.encodeFunctionData("executeBatch", [
		// 	[
		// 		"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43",
		// 		"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43",
		// 	],
		// 	[ethers.parseEther("4"), ethers.parseEther("3")],
		// 	["0x", "0x"],
		// ]),
		callData: Account.interface.encodeFunctionData("execute", [
			"0xF6f94b71bbdc4716dc138A04593a7fb0504F3e43",
			ethers.parseEther("4"),
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
	console.log({ userOpHash, userOp });
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
