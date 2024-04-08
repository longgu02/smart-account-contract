import { ethers } from "hardhat";
import {
	calculateNativeSessionKeyData,
	genMerkleTree,
} from "../utils/sessionKey";
import { keccak256 } from "ethereumjs-util";
import { ISingleOwnerPlugin } from "../typechain-types";
import { pack } from "../utils/helpers";

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
	const [signer0, signer1, signer2] = await ethers.getSigners();

	// Setting up
	const defaultAbi = ethers.AbiCoder.defaultAbiCoder();

	const counterPlugin = await ethers.getContractAt(
		"CounterPlugin",
		CTPLUGIN_ADDRESS
	);
	const subscriptionPlugin = await ethers.getContractAt(
		"SubscriptionPlugin",
		SUBPLUGIN_ADDRESS
	);
	const SingleOwnerPlugin = await ethers.getContractAt(
		"SingleOwnerPlugin",
		"0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
	);

	const pluginManifest = await subscriptionPlugin.pluginManifest();
	const subscriptionManifest = await subscriptionPlugin.pluginManifest();
	const types = [
		"bytes4[]", // interfaceIds
		"bytes4[]", // dependencyInterfaceIds
		"bytes4[]", // executionFunctions
		"bytes4[]", // permittedExecutionSelectors
		"bool", // permitAnyExternalAddress
		"bool", // canSpendNativeToken
		"tuple(address,bool,bytes4[])[]", // permittedExternalCalls
		"tuple(bytes4,tuple(uint8,uint8,uint256))[]", // userOpValidationFunctions
		"tuple(bytes4,tuple(uint8,uint8,uint256))[]", // runtimeValidationFunctions
		"tuple(bytes4,tuple(uint8,uint8,uint256))[]", // preUserOpValidationHooks
		"tuple(bytes4,tuple(uint8,uint8,uint256))[]", // preRuntimeValidationHooks
		"tuple(bytes4,tuple(uint8,uint8,uint256),tuple(uint8,uint8,uint256))[]", // executionHooks
	];

	const result: any[][][][] = [];

	const test = pluginManifest.map((attr: any, index1) => {
		if (!result[index1]) {
			result[index1] = [];
		}
		if (
			attr.length > 0 &&
			typeof attr != "boolean" &&
			typeof attr != "string"
		) {
			attr.map((value: any, index2) => {
				if (!result[index1][index2]) {
					result[index1][index2] = [];
				}
				if (
					value.length > 0 &&
					typeof value != "boolean" &&
					typeof value != "string"
				) {
					value.map((val: any, index3) => {
						if (!result[index1][index2][index3]) {
							result[index1][index2][index3] = [];
						}
						if (
							val.length > 0 &&
							typeof val != "boolean" &&
							typeof val != "string"
						) {
							val.map((a: any, index4) => {
								if (!result[index1][index2][index3]) {
									result[index1][index2][index3] = [];
								}
								console.log(
									[index1, index2, index3, index4],
									Number(a.toString())
								);
								result[index1][index2][index3][index4] = a;
							});
						} else {
							console.log([index1, index2, index3], val);
							result[index1][index2][index3] = val;
						}
					});
				} else {
					console.log([index1, index2], value);

					result[index1][index2] = value;
				}
			});
		} else {
			console.log([index1], attr);
			result[index1] = attr;
		}
	});
	console.log({ subscriptionManifest });
	console.log({ result });

	// const encoded = defaultAbi.encode(types, [...pluginManifest]);
	// const encoded = defaultAbi.encode(types, [
	// 	[],
	// 	["0xf23b1ed7"],
	// 	["0xd09de08a"],
	// 	[],
	// 	false,
	// 	false,
	// 	[],
	// 	[["0xd09de08a", [2, 0, 0]]],
	// 	[],
	// 	[],
	// 	[["0xd09de08a", [4, 0, 0]]],
	// 	[],
	// ]);
	const encoded = defaultAbi.encode(types, subscriptionManifest);
	const manifestHash = ethers.keccak256(
		"0x0000000000000000000000000000000000000000000000000000000000000020" +
			encoded.slice(2)
	);

	const FunctionReferenceLib = await ethers.getContractFactory(
		"FunctionReferenceLib"
	);
	// const contractSingleOwner: ISingleOwnerPlugin =
	// 	(await ISingleOwnerPlugin.deploy()) as ISingleOwnerPlugin;

	const functionReferenceLib = await FunctionReferenceLib.deploy();

	const dependencies = [
		pack(
			SP_ADDRESS,
			1
			// SingleOwnerPlugin.FunctionId.USER_OP_VALIDATION_OWNER
		),
	];
	// const dep = defaultAbi.encode(["bytes21"], functionReferenceLib);
	console.log({
		manifestHash,
	});
	console.log({
		plugin: CTPLUGIN_ADDRESS,
		manifestHash: manifestHash,
		pluginInstallData: "0x",
		dependencies: dependencies,
	});

	const AccountFactory = await ethers.getContractFactory("AccountFactory");

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

	const CounterPlugin = await ethers.getContractFactory("CounterPlugin");
	const SubscriptionPlugin = await ethers.getContractFactory(
		"SubscriptionPlugin"
	);
	const userOp = {
		sender, // smart account address
		nonce: await entryPoint.getNonce(sender, 0),
		initCode,
		// callData: Account.interface.encodeFunctionData("execute", [
		// 	await signer1.getAddress(),
		// 	ethers.parseEther("0"),
		// 	"0x",
		// ]),
		// callData: Account.interface.encodeFunctionData("execute", [
		// 	SUBPLUGIN_ADDRESS,
		// 	ethers.parseEther("0"),
		// 	SubscriptionPlugin.interface.encodeFunctionData("subscribe", [
		// 		signer1.address,
		// 		ethers.parseEther("7"),
		// 	]),
		// ]),
		callData: Account.interface.encodeFunctionData("installPlugin", [
			SUBPLUGIN_ADDRESS,
			manifestHash,
			"0x",
			dependencies,
		]),
		// callData: Account.interface.encodeFunctionData("executeBatch", [
		// 	[await signer1.getAddress(), await signer1.getAddress()],
		// 	[ethers.parseEther("4"), ethers.parseEther("3")],
		// 	["0x", "0x"],
		// ]),
		callGasLimit: 900_000 * 10,
		verificationGasLimit: 900_000 * 10,
		preVerificationGas: 400_000 * 10,
		maxFeePerGas: ethers.parseUnits("1000", "gwei"),
		maxPriorityFeePerGas: ethers.parseUnits("500", "gwei"),
		paymasterAndData: PM_ADDRESS, // PM_ADDRESS
		signature: "0x",
	};

	const userOpHash = await entryPoint.getUserOpHash(userOp);

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

	const accountContract = await ethers.getContractAt(
		"Account",
		sender,
		signer1
	);
	const tx2 = await accountContract.installPlugin(
		SUBPLUGIN_ADDRESS,
		manifestHash,
		"0x",
		dependencies
	);

	const rec = await tx2.wait();
	console.log(rec);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
