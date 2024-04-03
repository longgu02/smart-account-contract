import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xfacff941e53707bc22e21d45aa8573bc4e477e34";
const AF_ADDRESS = "0xFE5f411481565fbF70D8D33D992C78196E014b90";
const EP_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
const PM_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
const SM_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
const ERC20SM_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
const NATIVESM_ADDRESS = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
const ECDSASM_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
const SP_ADDRESS = "0x56fC17a65ccFEC6B7ad0aDe9BD9416CB365B9BE8";
const CTPLUGIN_ADDRESS = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
const SUBPLUGIN_ADDRESS = "0x638A246F0Ec8883eF68280293FFE8Cfbabe61B44";

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

	console.log(`counter: ${await counterPlugin.count(acc)}`);
	console.log(
		`sub: ${await subscriptionPlugin.subscriptions(signer1.address, acc)}`
	);
	console.log(`account balance: ${await provider.getBalance(acc)}`);
	console.log(
		`Merkle root: ${(await sessionKeyManager.getSessionKeys(acc)).merkleRoot}`
	);
	// console.log(`ECDSA Init: ${await ecdsaModule.getOwner(acc)}`);
	console.log(
		`balance: ${await signer1.getAddress()} : ${await provider.getBalance(
			await signer1.getAddress()
		)}`
	);

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
