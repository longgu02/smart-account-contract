import { ethers } from "hardhat";

const acc = "0xd3e5b33d4e94ef7764b8a9341c1004df7ebbcd01";
const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const FACTORY_ADDRESS = "0x0b3b4d0F8348A65D5Ba0bc365f640B8Ff9baf31F";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xD0ea240F7e207c4A9866952ce3bAE9E35Df01e2b";

async function main() {
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
	const mtkContract = await ethers.getContractAt("MyToken", MTK_ADDRESS);

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
