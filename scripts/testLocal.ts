import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0x15ae0f06d83c9f5b03180fb66cf4b2d6a7ae580a";
export const AF_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const SM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const ERC20SM_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const NATIVESM_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const ECDSASM_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

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
	// const mtkContract = await ethers.getContractAt("MyToken", MTK_ADDRESS);

	const provider = new ethers.JsonRpcProvider("http://localhost:8545");
	const [signer0, signer1, signer2] = await ethers.getSigners();
	const account = await ethers.getContractAt("Account", acc);

	// const count = await account.count();
	const accountBalance = await entryPoint.balanceOf(acc);
	const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	// console.log(count);
	// console.log(`account: ${accountBalance}`);
	// console.log(`paymaster: ${paymasterBalance}`);
	// console.log(
	// 	`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	// );

	// console.log(
	// 	`receiver balance: ${await provider.getBalance(await signer2.getAddress())}`
	// );
	// console.log(`account balance: ${await provider.getBalance(acc)}`);
	// console.log(
	// 	`Merkle root: ${(await sessionKeyManager.getSessionKeys(acc)).merkleRoot}`
	// );
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
