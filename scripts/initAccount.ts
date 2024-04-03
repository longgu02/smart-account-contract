import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";

const FACTORY_NONCE = 1;
const acc = "0x21e12ec5793b7644de1eb22b246dc0e4e3b08eba";
const AF_ADDRESS = "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB";
const EP_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
const PM_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
const SM_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
const ERC20SM_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
const NATIVESM_ADDRESS = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
const ECDSASM_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
const SP_ADDRESS = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E";
const CTPLUGIN_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";

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
				SP_ADDRESS,
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
		callData: Account.interface.encodeFunctionData("executeBatch", [
			[await signer1.getAddress(), await signer1.getAddress()],
			[ethers.parseEther("4"), ethers.parseEther("3")],
			["0x", "0x"],
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
