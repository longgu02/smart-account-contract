import { ethers } from "hardhat";
import { pack } from "../utils/helpers";

const FACTORY_NONCE = 1;
const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xe382aa915e047268e66b6c7b0f0ca0a77b4df6fd";
export const SP_ADDRESS = "0x11c68f4FB6ef20cf27425B3271b58340673DB104";
export const AF_ADDRESS = "0xc0c317628033157e7A04999fF90cC779da9c1104";

export const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
export const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
export const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
export const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
export const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
export const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
export const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

async function main() {
	const [signer0, signer1] = await ethers.getSigners();
	// CREATE: hash(deployer + nonce)
	const defaultAbi = ethers.AbiCoder.defaultAbiCoder();

	const AccountFactory = await ethers.getContractFactory("AccountFactory");
	const address0 = await signer0.getAddress();
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);

	const transaction = {
		to: acc,
		value: ethers.parseEther("10"), // Sends 1 Ether
	};
	// only first time
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
	const subscriptionPlugin = await ethers.getContractAt(
		"SubscriptionPlugin",
		SUBPLUGIN_ADDRESS
	);

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

	const userOp: UserOp = {
		sender, // smart account address
		nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
		initCode,
		// callData: Account.interface.encodeFunctionData("execute"),
		callData: Account.interface.encodeFunctionData("installPlugin", [
			SUBPLUGIN_ADDRESS,
			manifestHash,
			"0x",
			dependencies,
		]),
		callGasLimit: "0x" + (200_000).toString(16),
		verificationGasLimit: "0x" + (200_000).toString(16),
		preVerificationGas: "0x" + (100_000).toString(16),
		maxFeePerGas: "0x" + ethers.parseUnits("100", "gwei").toString(16),
		maxPriorityFeePerGas: "0x" + ethers.parseUnits("50", "gwei").toString(16),
		// callGasLimit: "0x0",
		// verificationGasLimit: "0x0",
		// preVerificationGas: "0x0",
		// maxFeePerGas: "0x0",
		// maxPriorityFeePerGas: "0x0",
		paymasterAndData: PM_ADDRESS,
		signature: defaultAbi.encode(
			["bytes", "address"],
			[
				"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
				ECDSASM_ADDRESS,
			]
		),
	};
	// const userOpHash = await entryPoint.getUserOpHash(userOp);

	// const signatureWithModuleAddress = defaultAbi.encode(
	// 	["bytes", "address"],
	// 	[await signer0.signMessage(ethers.getBytes(userOpHash)), ECDSASM_ADDRESS]
	// );
	// userOp.signature = signatureWithModuleAddress;
	try {
		const { preVerificationGas, verificationGasLimit, callGasLimit } =
			await ethers.provider.send("eth_estimateUserOperationGas", [
				userOp,
				EP_ADDRESS,
			]);
		userOp.preVerificationGas = preVerificationGas;
		userOp.verificationGasLimit = verificationGasLimit;
		userOp.callGasLimit = callGasLimit;
	} catch (err) {
		console.log(err);
	}

	const { maxFeePerGas } = await ethers.provider.getFeeData();
	userOp.maxFeePerGas = "0x" + maxFeePerGas?.toString(16);

	const maxPriorityFeePerGas = await ethers.provider.send(
		"rundler_maxPriorityFeePerGas"
	);
	userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

	const userOpHash1 = await entryPoint.getUserOpHash(userOp);

	const signatureWithModuleAddress1 = defaultAbi.encode(
		["bytes", "address"],
		[await signer0.signMessage(ethers.getBytes(userOpHash1)), ECDSASM_ADDRESS]
	);
	userOp.signature = signatureWithModuleAddress1;
	console.log({ userOp });

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

	setTimeout(async () => {
		const { transactionHash } = await ethers.provider.send(
			"eth_getUserOperationByHash",
			[opHash]
		);

		console.log(transactionHash);
	}, 50000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
