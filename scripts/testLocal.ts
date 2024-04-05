import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xda7b1d6acbc52733a166e93396b3ea2fd4182e9c";

const SP_ADDRESS = "0x11c68f4FB6ef20cf27425B3271b58340673DB104";
const AF_ADDRESS = "0x43eFEc97A672cfCe9C91f08871C8D685D559D35c";
const EP_ADDRESS = "0x17Ba64A5A80487F3db8C18E084c8f7E072D42923";
const PM_ADDRESS = "0xAc8a8857840670D50629F5175FfCf07dF3420277";
const SM_ADDRESS = "0x6a61AB7B90fc8154d5d5975767F02d2F0F1e6F4E";
const ERC20SM_ADDRESS = "0x2f8539D1f432ad791bE864C079F1857C5C04D5Ef";
const NATIVESM_ADDRESS = "0x0eaD091889CF2BF85c61Fda4ac59A68b195EfEd1";
const ECDSASM_ADDRESS = "0xC9E19aAde4C9b8157667143F69EBED2425683b09";
const CTPLUGIN_ADDRESS = "0x36e344b4bAD3828772A52703e5DaA88aA1266CF3";
const SUBPLUGIN_ADDRESS = "0x159B550f49873A09c2543eE311711E434e36ec50";

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
	const accountBalance = await entryPoint.balanceOf(acc);
	const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	// console.log(count);
	// console.log(`account: ${accountBalance}`);
	console.log(`paymaster: ${paymasterBalance}`);
	// console.log(
	// 	`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	// );

	// console.log(
	// 	`receiver balance: ${await provider.getBalance(await signer2.getAddress())}`
	// );
	// const tx = await counterPlugin.increment();
	// const rec = await tx.wait();
	// console.log(rec);

	// console.log(`counter: ${await counterPlugin.count(acc)}`);
	// console.log(
	// 	`sub: ${await subscriptionPlugin.subscriptions(
	// 		"0x90F79bf6EB2c4f870365E785982E1f101E93b906",
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
