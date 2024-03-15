import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0x245409bc50ce8a8275c429a804b871f469734d9e";
const FACTORY_ADDRESS = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
const EP_ADDRESS = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";
const PM_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";
async function main() {
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
	// const mtkContract = await ethers.getContractAt("MyToken", MTK_ADDRESS);

	const provider = new ethers.JsonRpcProvider("http://localhost:8545");
	const [signer0, signer1] = await ethers.getSigners();
	const account = await ethers.getContractAt("Account", acc);

	const count = await account.count();
	const accountBalance = await entryPoint.balanceOf(acc);
	const paymasterBalance = await entryPoint.balanceOf(PM_ADDRESS);

	console.log(count);
	console.log(`account: ${accountBalance}`);
	console.log(`paymaster: ${paymasterBalance}`);
	console.log(
		`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	);

	console.log(
		`receiver balance: ${await provider.getBalance(await signer1.getAddress())}`
	);
	console.log(`account balance: ${await provider.getBalance(acc)}`);

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
