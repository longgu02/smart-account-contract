import { ethers } from "hardhat";
import { pack } from "../utils/helpers";

// const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xa034c2cb18025115d4aba6e5ccacc61da7ada3a3";
export const SP_ADDRESS = "0xedb8873491d44252876ad13D9bC362205B55F536";
export const AF_ADDRESS = "0xfdfCFe90879cC0C09d74878d2fd2080d8D7114f7";

// const EP_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";
// const PM_ADDRESS = "0x998abeb3E57409262aE5b751f60747921B33613E";

export const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";

export const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
export const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
export const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
export const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
export const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
export const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

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
	const afContract = await ethers.getContractAt("AccountFactory", AF_ADDRESS);

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
	// const dependencies = [pack(SP_ADDRESS, 1)];
	// console.log(
	// 	await account.installPlugin(
	// 		"0x159B550f49873A09c2543eE311711E434e36ec50",
	// 		"0x848770b485b2b000ba84ff7cde8b8de3fc41043dfa77193d9dbb509c004178c0",
	// 		"0x",
	// 		dependencies
	// 	)
	// );
	// console.log(await afContract.singleOwnerPlugin());
	// console.log(await account.checkPluginInstalled(SUBPLUGIN_ADDRESS));
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
