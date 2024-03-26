import { ethers } from "hardhat";

const MTK_ADDRESS = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const acc = "0x2b5a3ba1818c8e93bb852ab3b399756641550ceb";
const AF_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const SM_ADDRESS = "0x07882Ae1ecB7429a84f1D53048d35c4bB2056877";
const ERC20SM_ADDRESS = "0xA7c59f010700930003b33aB25a7a0679C860f29c";

async function main() {
	const entryPoint = await ethers.getContractAt("EntryPoint", EP_ADDRESS);
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
	console.log(`account: ${accountBalance}`);
	console.log(`paymaster: ${paymasterBalance}`);
	console.log(
		`signer0 balance: ${await provider.getBalance(await signer0.getAddress())}`
	);

	console.log(
		`receiver balance: ${await provider.getBalance(await signer2.getAddress())}`
	);
	console.log(`account balance: ${await provider.getBalance(acc)}`);
	console.log(
		`Merkle root: ${(await sessionKeyManager.getSessionKeys(acc)).merkleRoot}`
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
