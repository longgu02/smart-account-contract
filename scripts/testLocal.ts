import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0xda7b1d6acbc52733a166e93396b3ea2fd4182e9c";

export const SP_ADDRESS = "0x5bf5b11053e734690269C6B9D438F8C9d48F528A";
export const AF_ADDRESS = "0xffa7CA1AEEEbBc30C874d32C7e22F052BbEa0429";
export const EP_ADDRESS = "0x3aAde2dCD2Df6a8cAc689EE797591b2913658659";
export const PM_ADDRESS = "0xab16A69A5a8c12C732e0DEFF4BE56A70bb64c926";
export const SM_ADDRESS = "0xE3011A37A904aB90C8881a99BD1F6E21401f1522";
export const ERC20SM_ADDRESS = "0x1f10F3Ba7ACB61b2F50B9d6DdCf91a6f787C0E82";
export const NATIVESM_ADDRESS = "0x457cCf29090fe5A24c19c1bc95F492168C0EaFdb";
export const ECDSASM_ADDRESS = "0x525C7063E7C20997BaaE9bDa922159152D0e8417";
export const CTPLUGIN_ADDRESS = "0x38a024C0b412B9d1db8BC398140D00F5Af3093D4";
export const SUBPLUGIN_ADDRESS = "0x5fc748f1FEb28d7b76fa1c6B07D8ba2d5535177c";

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
		`sub: ${await subscriptionPlugin.subscriptions(
			"0x90F79bf6EB2c4f870365E785982E1f101E93b906",
			acc
		)}`
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
