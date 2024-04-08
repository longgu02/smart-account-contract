import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";

const FACTORY_NONCE = 1;
const acc = "0x74405bfafc55f3abb06606ef9a7631f8cbc34df0";
const SP_ADDRESS = "0x851356ae760d987E095750cCeb3bC6014560891C";
const AF_ADDRESS = "0xf5059a5D33d5853360D16C683c16e67980206f36";
const EP_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";
const PM_ADDRESS = "0x998abeb3E57409262aE5b751f60747921B33613E";
const SM_ADDRESS = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
const ERC20SM_ADDRESS = "0x4826533B4897376654Bb4d4AD88B7faFD0C98528";
const NATIVESM_ADDRESS = "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf";
const ECDSASM_ADDRESS = "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF";
const CTPLUGIN_ADDRESS = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";
const SUBPLUGIN_ADDRESS = "0x9d4454B023096f34B160D6B654540c56A1F81688";

async function main() {
	const [signer1, signer0, signer2] = await ethers.getSigners();
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
	// await entryPoint.depositTo(PM_ADDRESS, {
	// 	value: ethers.parseEther("10"),
	// });

	// await entryPoint.depositTo(PM_ADDRESS, {
	// 	value: ethers.parseEther("30"),
	// });

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
			ethers.parseEther("0"),
			"0x",
		]),
		callGasLimit: 900_000 * 6,
		verificationGasLimit: 900_000 * 6,
		preVerificationGas: 900_000 * 6,
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
