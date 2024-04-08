import { ethers } from "hardhat";

// const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xc02e40414992d80c7a2df88bd1e66d7894eb2cf0";
export const SP_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
export const AF_ADDRESS = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";

// const EP_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";
// const PM_ADDRESS = "0x998abeb3E57409262aE5b751f60747921B33613E";

export const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";

export const SM_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
export const ERC20SM_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
export const NATIVESM_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";
export const ECDSASM_ADDRESS = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
export const CTPLUGIN_ADDRESS = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
export const SUBPLUGIN_ADDRESS = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";

async function main() {
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
	const ecdsaModule = await ethers.getContractAt(
		"EcdsaOwnershipRegistryModule",
		ECDSASM_ADDRESS
	);
	const sessionKeyManager = await ethers.getContractAt(
		"SessionKeyManager",
		SM_ADDRESS
	);
	const counterPlugin = await ethers.getContractAt(
		"CounterPlugin",
		CTPLUGIN_ADDRESS
	);
	const subscriptionPlugin = await ethers.getContractAt(
		"SubscriptionPlugin",
		SUBPLUGIN_ADDRESS
	);
	// const mtkContract = await ethers.getContractAt("MyToken", MTK_ADDRESS);

	const provider = new ethers.JsonRpcProvider("http://localhost:8545");
	const [signer0, signer1, signer2] = await ethers.getSigners();
	const account = await ethers.getContractAt("Account", acc);

	// const count = await account.count();
	// const accountBalance = await entryPoint.balanceOf(acc);
	const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	// console.log(count);
	// console.log(`account: ${accountBalance}`);
	console.log(`paymaster: ${paymasterBalance}`);
	// console.log(
	// 	`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	// );

	// const AccountFactory = await ethers.getContractFactory("AccountFactory");

	// let initCode =
	// 	AF_ADDRESS +
	// 	AccountFactory.interface
	// 		.encodeFunctionData("createAccount", [
	// 			"0xA10cF1b64fAFCD75ED18A905F96408f38f570fa6",
	// 			ECDSASM_ADDRESS,
	// 			EP_ADDRESS,
	// 		])
	// 		.slice(2);

	// let sender: any;

	// try {
	// 	await entryPoint.getSenderAddress(initCode);
	// } catch (ex: any) {
	// 	// Local
	// 	sender = "0x" + ex.data.data.slice(-40);
	// 	// Testnet
	// 	// console.log(ex.data);
	// 	// sender = "0x" + ex.data.slice(-40);
	// }

	// const code = await ethers.provider.getCode(sender);
	// if (code !== "0x") {
	// 	initCode = "0x";
	// }

	// console.log("deploy", initCode);

	// console.log(
	// 	`receiver balance: ${await provider.getBalance(await signer2.getAddress())}`
	// );
	// const tx = await counterPlugin.increment();
	// const rec = await tx.wait();
	// console.log(rec);

	// console.log(`counter: ${await counterPlugin.count(acc)}`);
	// console.log(
	// 	`sub: ${await subscriptionPlugin.subscriptions(
	// 		"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
	// 		acc
	// 	)}`
	// );
	// console.log(`account balance: ${await provider.getBalance(acc)}`);
	// console.log(
	// 	`Merkle root: ${(await sessionKeyManager.getSessionKeys(acc)).merkleRoot}`
	// );
	// // console.log(`ECDSA Init: ${await ecdsaModule.getOwner(acc)}`);
	// console.log(
	// 	`balance: ${await signer1.getAddress()} : ${await provider.getBalance(
	// 		await signer1.getAddress()
	// 	)}`
	// );

	// console.log(`account erc20 balance: ${await mtkContract.balanceOf(acc)}`);
	// console.log(
	// 	`signer1 erc20 balance: ${await mtkContract.balanceOf(
	// 		await signer1.getAddress()
	// 	)}`
	// );
	// console.log(
	// 	`signer1 balance: ${await provider.getBalance(await signer1.getAddress())}`
	// );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
